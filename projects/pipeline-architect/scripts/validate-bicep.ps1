# Bicep DevOps Pipeline - Local Validation Script
# Use this script to validate templates locally before committing

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "production", "all")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$Lint,
    
    [Parameter(Mandatory=$false)]
    [switch]$Build,
    
    [Parameter(Mandatory=$false)]
    [switch]$Validate,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf,
    
    [Parameter(Mandatory=$false)]
    [switch]$SecurityScan,
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [switch]$FailOnWarnings
)

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

$Script:ExitCode = 0
$Script:Warnings = 0
$Script:Errors = 0

$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

# ═══════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════

function Write-Header {
    param([string]$Message)
    Write-Host "`n========== $Message ==========" -ForegroundColor $Colors.Header
}

function Write-Status {
    param([string]$Message, [string]$Status = "Info")
    $color = $Colors[$Status]
    $icon = switch ($Status) {
        "Success" { "[✓]" }
        "Warning" { "[!]" }
        "Error" { "[X]" }
        default { "[i]" }
    }
    Write-Host "  $icon $Message" -ForegroundColor $color
}

function Increment-Counter {
    param([string]$Type)
    switch ($Type) {
        "Warning" { $Script:Warnings++ }
        "Error" { $Script:Errors++ }
    }
}

function Test-Command {
    param([string]$Command)
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    if (-not $exists) {
        Write-Status "Command '$Command' not found" "Error"
        return $false
    }
    return $true
}

# ═══════════════════════════════════════════════════════════════
# VALIDATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════

function Initialize-Environment {
    Write-Header "Environment Check"
    
    # Check Bicep CLI
    if (-not (Test-Command "bicep")) {
        if (Test-Command "az") {
            Write-Status "Installing Bicep via Azure CLI..." "Info"
            az bicep install
        } else {
            Write-Status "Please install Azure CLI: https://aka.ms/installazurecli" "Error"
            exit 1
        }
    }
    
    # Get Bicep version
    $bicepVersion = bicep --version
    Write-Status "Bicep CLI: $bicepVersion"
    
    # Check for Checkov
    if ($SecurityScan) {
        $checkovExists = Test-Command "checkov"
        if (-not $checkovExists) {
            Write-Status "Checkov not found. Install with: pip install checkov" "Warning"
            Write-Status "Security scan will be skipped" "Warning"
        }
    }
}

function Invoke-LintCheck {
    param([string]$TemplatePath)
    
    Write-Header "Lint Check: $TemplatePath"
    
    if (-not (Test-Path $TemplatePath)) {
        Write-Status "Template not found: $TemplatePath" "Error"
        Increment-Counter "Error"
        return
    }
    
    Write-Status "Running Bicep linter..." "Info"
    
    $result = bicep lint $TemplatePath 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Status "Lint check passed" "Success"
    } else {
        Write-Status "Lint check failed" "Error"
        Write-Host $result -ForegroundColor Red
        Increment-Counter "Error"
    }
}

function Invoke-BuildCheck {
    param([string]$TemplatePath, [string]$OutputPath)
    
    Write-Header "Build Check: $TemplatePath"
    
    if (-not (Test-Path $TemplatePath)) {
        Write-Status "Template not found: $TemplatePath" "Error"
        Increment-Counter "Error"
        return
    }
    
    $outputDir = Split-Path $OutputPath -Parent
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    Write-Status "Compiling Bicep to ARM..." "Info"
    
    $result = bicep build $TemplatePath --outfile $OutputPath 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Status "Build successful: $OutputPath" "Success"
    } else {
        Write-Status "Build failed" "Error"
        Write-Host $result -ForegroundColor Red
        Increment-Counter "Error"
    }
}

function Invoke-Validation {
    param([string]$TemplatePath, [string]$ParameterPath, [string]$TargetSub)
    
    Write-Header "Deployment Validation"
    
    if (-not $TargetSub) {
        Write-Status "No subscription ID provided. Skipping Azure validation." "Warning"
        Increment-Counter "Warning"
        return
    }
    
    # Verify Azure login
    $account = az account show --query id -o tsv 2>$null
    if (-not $account) {
        Write-Status "Not logged in to Azure. Running az login..." "Info"
        az login | Out-Null
    }
    
    # Set subscription
    if ($account -ne $TargetSub) {
        az account set --subscription $TargetSub | Out-Null
    }
    
    Write-Status "Validating deployment against subscription: $TargetSub" "Info"
    
    $validation = az deployment sub validate `
        --name "local-validation-$(Get-Date -Format 'yyyyMMdd-HHmmss')" `
        --location $Location `
        --template-file $TemplatePath `
        --parameters $ParameterPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Validation passed" "Success"
    } else {
        Write-Status "Validation failed" "Error"
        Write-Host $validation -ForegroundColor Red
        Increment-Counter "Error"
    }
}

function Invoke-WhatIf {
    param([string]$TemplatePath, [string]$ParameterPath, [string]$TargetSub)
    
    Write-Header "What-If Analysis"
    
    if (-not $TargetSub) {
        Write-Status "No subscription ID provided. Skipping What-If." "Warning"
        Increment-Counter "Warning"
        return
    }
    
    Write-Status "Running What-If analysis..." "Info"
    Write-Status "This may take a few moments..." "Info"
    
    $whatIf = az deployment sub what-if `
        --name "local-whatif-$(Get-Date -Format 'yyyyMMdd-HHmmss')" `
        --location $Location `
        --template-file $TemplatePath `
        --parameters $ParameterPath `
        --no-pretty-print 2>&1 | Out-String
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "What-If analysis complete" "Success"
        
        # Summary
        $deletes = ($whatIf | Select-String -Pattern "\s+delete" -AllMatches).Matches.Count
        $creates = ($whatIf | Select-String -Pattern "\s+create" -AllMatches).Matches.Count
        $modifies = ($whatIf | Select-String -Pattern "\s+modify" -AllMatches).Matches.Count
        
        Write-Status "Changes Summary:"
        Write-Host "    📦 Create:   $creates resources"
        Write-Host "    🔄 Modify:   $modifies resources"
        Write-Host "    🗑️  Delete:   $deletes resources"
        
        if ($deletes -gt 0) {
            Write-Status "⚠️ DESTRUCTIVE CHANGES DETECTED" "Warning"
            Increment-Counter "Warning"
        }
        
        # Save output
        $outputFile = "./what-if-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
        $whatIf | Out-File -FilePath $outputFile
        Write-Status "Full output saved to: $outputFile"
    } else {
        Write-Status "What-If analysis failed" "Error"
        Write-Host $whatIf -ForegroundColor Red
        Increment-Counter "Error"
    }
}

function Invoke-SecurityScan {
    param([string]$TemplateDir)
    
    Write-Header "Security Scan"
    
    if (-not (Test-Command "checkov")) {
        Write-Status "Checkov not available. Install: pip install checkov" "Warning"
        Increment-Counter "Warning"
        return
    }
    
    Write-Status "Running Checkov security scan..." "Info"
    
    $outputDir = "./security-reports"
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    
    checkov --directory $TemplateDir `
            --framework bicep `
            --output jsonfile `
            --output-file-path "$outputDir/checkov-$timestamp.json" `
            --compact 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Security scan passed" "Success"
    } else {
        Write-Status "Security issues found. Check: $outputDir/checkov-$timestamp.json" "Warning"
        Increment-Counter "Warning"
    }
}

# ═══════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════

Initialize-Environment

# Determine which environments to validate
$environmentsToProcess = if ($Environment -eq "all") {
    @("dev", "staging", "production")
} else {
    @($Environment)
}

$basePath = Split-Path -Parent $PSScriptRoot | Split-Path -Parent

foreach ($env in $environmentsToProcess) {
    Write-Header "Processing Environment: $env.ToUpper()"
    
    $templatePath = Join-Path $basePath "bicep/main.bicep"
    $paramPath = Join-Path $basePath "parameters/$env.parameters.json"
    $outputPath = Join-Path $basePath ".output/main-$env.json"
    $modulePath = Join-Path $basePath "bicep"
    
    # Validate paths
    if (-not (Test-Path $paramPath)) {
        Write-Status "Parameter file not found: $paramPath" "Warning"
        Increment-Counter "Warning"
        continue
    }
    
    # Run selected checks
    if ($Lint -or (-not ($Build -or $Validate -or $WhatIf -or $SecurityScan))) {
        Invoke-LintCheck -TemplatePath $templatePath
        
        # Also lint modules
        $modules = Get-ChildItem -Path "$modulePath/modules" -Filter "*.bicep" -Recurse
        foreach ($module in $modules) {
            Invoke-LintCheck -TemplatePath $module.FullName
        }
    }
    
    if ($Build) {
        Invoke-BuildCheck -TemplatePath $templatePath -OutputPath $outputPath
    }
    
    if ($Validate) {
        Invoke-Validation -TemplatePath $templatePath -ParameterPath $paramPath -TargetSub $SubscriptionId
    }
    
    if ($WhatIf) {
        Invoke-WhatIf -TemplatePath $templatePath -ParameterPath $paramPath -TargetSub $SubscriptionId
    }
    
    if ($SecurityScan) {
        Invoke-SecurityScan -TemplateDir $modulePath
    }
}

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

Write-Header "Validation Summary"

Write-Host "Errors:   $Script:Errors" -ForegroundColor $(if ($Script:Errors -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $Script:Warnings" -ForegroundColor $(if ($Script:Warnings -gt 0) { "Yellow" } else { "Green" })

if ($Script:Errors -gt 0) {
    Write-Status "Validation failed. Please fix errors before proceeding." "Error"
    exit 1
} elseif ($Script:Warnings -gt 0 -and $FailOnWarnings) {
    Write-Status "Validation passed with warnings. --FailOnWarnings was specified." "Warning"
    exit 1
} else {
    Write-Status "Validation completed successfully!" "Success"
    exit 0
}
