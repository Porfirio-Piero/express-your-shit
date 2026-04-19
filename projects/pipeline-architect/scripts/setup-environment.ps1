# Bicep DevOps Pipeline - Environment Setup Script
# This script helps configure the necessary Azure resources for the pipeline

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = 'eastus',
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateResourceGroup,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateServicePrincipal,
    
    [Parameter(Mandatory=$false)]
    [string]$DevOpsOrgUrl = "",
    
    [Parameter(Mandatory=$false)]
    [string]$DevOpsProject = ""
)

# Color constants
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor $Colors.Header
}

function Write-Status {
    param([string]$Message, [string]$Status = "Info")
    $color = $Colors[$Status]
    $icon = switch ($Status) {
        "Success" { "✅" }
        "Warning" { "⚠️" }
        "Error" { "❌" }
        default { "ℹ️" }
    }
    Write-Host "  $icon $Message" -ForegroundColor $color
}

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

Write-Header "Validating Environment"

$validEnvironments = @("dev", "staging", "production")
if ($validEnvironments -notcontains $Environment.ToLower()) {
    Write-Status "Invalid environment. Must be one of: $($validEnvironments -join ', ')" "Error"
    exit 1
}

Write-Status "Environment validated: $Environment"

# Check Azure CLI
$azVersion = az version --query '"azure-cli"' -o tsv 2>$null
if (-not $azVersion) {
    Write-Status "Azure CLI not found. Please install from: https://aka.ms/installazurecli" "Error"
    exit 1
}
Write-Status "Azure CLI version: $azVersion"

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Status "PowerShell 7+ recommended. Current version: $($PSVersionTable.PSVersion)" "Warning"
}

# ═══════════════════════════════════════════════════════════════
# AZURE LOGIN & SUBSCRIPTION SETUP
# ═══════════════════════════════════════════════════════════════

Write-Header "Azure Authentication"

$currentAccount = az account show --query id -o tsv 2>$null
if (-not $currentAccount) {
    Write-Status "Not logged in to Azure. Initiating login..." "Info"
    az login | Out-Null
}

$currentSub = az account show --query id -o tsv
if ($currentSub -ne $SubscriptionId) {
    Write-Status "Setting subscription to: $SubscriptionId"
    az account set --subscription $SubscriptionId
}

Write-Status "Using subscription: $(az account show --query name -o tsv)" "Success"

# ═══════════════════════════════════════════════════════════════
# SERVICE PRINCIPAL CREATION
# ═══════════════════════════════════════════════════════════════

if ($CreateServicePrincipal) {
    Write-Header "Creating Service Principal"
    
    $spName = "bicep-pipeline-$Environment-$ProjectName"
    Write-Status "Creating service principal: $spName" "Info"
    
    $sp = az ad sp create-for-rbac `
        --name $spName `
        --role "Contributor" `
        --scopes "/subscriptions/$SubscriptionId" `
        --output json | ConvertFrom-Json
    
    if (-not $sp) {
        Write-Status "Failed to create service principal" "Error"
        exit 1
    }
    
    Write-Status "Service Principal created successfully" "Success"
    
    # Output credentials for DevOps
    Write-Host "`n" -NoNewline
    Write-Host "========== SERVICE PRINCIPAL CREDENTIALS ==========" -ForegroundColor Yellow
    Write-Host "Subscription ID: $SubscriptionId"
    Write-Host "Tenant ID: $($sp.tenant)"
    Write-Host "Service Principal ID: $($sp.appId)"
    Write-Host "Service Principal Key: $($sp.password)"
    Write-Host "Service Principal Name: $spName"
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "`n⚠️  SAVE THESE CREDENTIALS - The password cannot be retrieved again!`n"
    
    # Save to file
    $outputFile = "service-principal-$Environment.json"
    $sp | ConvertTo-Json | Out-File -FilePath $outputFile
    Write-Status "Credentials saved to: $outputFile"
}

# ═══════════════════════════════════════════════════════════════
# RESOURCE GROUP SETUP
# ═══════════════════════════════════════════════════════════════

if ($CreateResourceGroup) {
    Write-Header "Creating Resource Group"
    
    $rgName = "rg-$ProjectName-$Environment"
    $rgExists = az group exists --name $rgName
    
    if ($rgExists -eq "true") {
        Write-Status "Resource group already exists: $rgName" "Warning"
    } else {
        Write-Status "Creating resource group: $rgName in $Location"
        az group create --name $rgName --location $Location --tags `
            createdBy="pipeline-setup" `
            environment=$Environment `
            project=$ProjectName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Resource group created successfully" "Success"
        } else {
            Write-Status "Failed to create resource group" "Error"
            exit 1
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# AZURE DEVOPS CONFIGURATION
# ═══════════════════════════════════════════════════════════════

if ($DevOpsOrgUrl -and $DevOpsProject) {
    Write-Header "Azure DevOps Configuration"
    
    # Check Azure DevOps CLI extension
    $devopsExt = az extension list --query "[?name=='azure-devops']" -o tsv
    if (-not $devopsExt) {
        Write-Status "Installing Azure DevOps CLI extension..." "Info"
        az extension add --name azure-devops | Out-Null
    }
    
    Write-Status "Configuring Azure DevOps defaults"
    az devops configure --defaults organization=$DevOpsOrgUrl project=$DevOpsProject
    
    # Create environments
    $environments = @("Development", "Staging", "Production")
    foreach ($env in $environments) {
        $envExists = az devops environment list --query "[?name=='$env']" -o tsv 2>$null
        if (-not $envExists) {
            Write-Status "Creating environment: $env" "Info"
            az devops environment create --name $env --description "Managed by Bicep Pipeline" | Out-Null
        } else {
            Write-Status "Environment already exists: $env" "Info"
        }
    }
    
    Write-Status "DevOps environments configured" "Success"
}

# ═══════════════════════════════════════════════════════════════
# VALIDATE BICEP DEPLOYMENT
# ═══════════════════════════════════════════════════════════════

Write-Header "Validating Bicep Deployment"

$bicepPath = "../bicep/main.bicep"
$paramsPath = "../parameters/$Environment.parameters.json"

if (Test-Path $bicepPath) {
    Write-Status "Found bicep template: $bicepPath" "Info"
    
    if (Test-Path $paramsPath) {
        Write-Status "Found parameter file: $paramsPath" "Info"
        
        Write-Status "Running validation..." "Info"
        $validation = az deployment sub validate `
            --name "validate-$Environment" `
            --location $Location `
            --template-file $bicepPath `
            --parameters $paramsPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Validation successful" "Success"
        } else {
            Write-Status "Validation failed" "Error"
            Write-Host $validation -ForegroundColor Red
        }
    } else {
        Write-Status "Parameter file not found: $paramsPath" "Warning"
    }
} else {
    Write-Status "Bicep template not found: $bicepPath" "Error"
}

# ═══════════════════════════════════════════════════════════════
# WHAT-IF ANALYSIS
# ═══════════════════════════════════════════════════════════════

Write-Header "Running What-If Analysis"

if (Test-Path $bicepPath -and Test-Path $paramsPath) {
    Write-Status "Calculating changes..." "Info"
    
    $whatIf = az deployment sub what-if `
        --name "whatif-$Environment" `
        --location $Location `
        --template-file $bicepPath `
        --parameters $paramsPath `
        --result-type FullResourcePayloads 2>&1 | Out-String
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "What-If analysis complete" "Success"
        
        # Parse for destructive changes
        if ($whatIf -match "delete" -or $whatIf -match "remove") {
            Write-Status "⚠️ DESTRUCTIVE CHANGES DETECTED ⚠️" "Warning"
            Write-Status "Review the output carefully before deploying"
        }
    } else {
        Write-Status "What-If analysis failed" "Error"
    }
}

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

Write-Header "Setup Complete"

Write-Host "`nEnvironment configuration summary:" -ForegroundColor White
Write-Host "  • Environment:     $Environment"
Write-Host "  • Subscription:    $SubscriptionId"
Write-Host "  • Project Name:    $ProjectName"
Write-Host "  • Location:        $Location"

if ($CreateResourceGroup) {
    Write-Host "  • Resource Group:  rg-$ProjectName-$Environment"
}

if ($CreateServicePrincipal) {
    Write-Host "  • Service Principal: bicep-pipeline-$Environment-$ProjectName"
}

Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  1. Configure Azure DevOps service connections using the generated credentials"
Write-Host "  2. Create the 'bicep-deployment-variables' variable group"
Write-Host "  3. Import the pipeline from azure-pipelines.yml"
Write-Host "  4. Run the pipeline with validation-only first"

Write-Host "`nFor support, refer to the documentation in /docs" -ForegroundColor Gray
