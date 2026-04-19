# Bicep Validation Script
param Environment string = "dev"
param ResourceGroupName string = "rg-agentic-infra-dev"
param Location string = "East US"

Write-Host "🔍 Running Bicep Validation for $Environment environment..." -ForegroundColor Yellow

# Check if Bicep CLI is available
try {
    $bicepVersion = bicep --version
    Write-Host "✅ Bicep CLI installed: $bicepVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Bicep CLI not found. Please install Bicep CLI."
    exit 1
}

# Validate main template
Write-Host "📋 Validating main template..." -ForegroundColor Yellow
try {
    $validationResult = bicep build "infrastructure/main.bicep" --outfile "infrastructure/main.json"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Main template validation passed" -ForegroundColor Green
    } else {
        Write-Error "❌ Main template validation failed"
        exit 1
    }
} catch {
    Write-Error "❌ Error validating main template: $_"
    exit 1
}

# Validate all module files
Write-Host "🔧 Validating module templates..." -ForegroundColor Yellow
$modules = @("storage.bicep", "networking.bicep", "compute.bicep", "monitoring.bicep")

foreach ($module in $modules) {
    $modulePath = "infrastructure/modules/$module"
    if (Test-Path $modulePath) {
        try {
            $validationResult = bicep build $modulePath --outfile "infrastructure/modules/$($module.Replace('.bicep', '.json'))"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $module validation passed" -ForegroundColor Green
            } else {
                Write-Error "❌ $module validation failed"
                exit 1
            }
        } catch {
            Write-Error "❌ Error validating $module : $_"
            exit 1
        }
    } else {
        Write-Warning "⚠️  Module file not found: $modulePath"
    }
}

# Check parameter files
Write-Host "📁 Validating parameter files..." -ForegroundColor Yellow
$environments = @("dev", "qa", "stage", "prod")

foreach ($env in $environments) {
    $paramFile = "infrastructure/parameters/$env.parameters.json"
    if (Test-Path $paramFile) {
        Write-Host "✅ Parameter file found for $env" -ForegroundColor Green
    } else {
        Write-Warning "⚠️  Parameter file not found for $env: $paramFile"
    }
}

# Security best practices validation
Write-Host "🔒 Checking security best practices..." -ForegroundColor Yellow

# Check for HTTPS enforcement
$mainBicep = Get-Content "infrastructure/main.bicep" -Raw
if ($mainBicep -match "httpsOnly.*true") {
    Write-Host "✅ HTTPS enforcement found" -ForegroundColor Green
} else {
    Write-Warning "⚠️  HTTPS enforcement not found" -ForegroundColor Yellow
}

# Check for TLS enforcement
if ($mainBicep -match "minimumTlsVersion.*TLS1_2") {
    Write-Host "✅ TLS 1.2+ enforcement found" -ForegroundColor Green
} else {
    Write-Warning "⚠️  TLS enforcement not found" -ForegroundColor Yellow
}

# Check for managed identity
if ($mainBicep -match "type.*SystemAssigned") {
    Write-Host "✅ System Managed Identity configured" -ForegroundColor Green
} else {
    Write-Warning "⚠️  System Managed Identity not found" -ForegroundColor Yellow
}

Write-Host "🎉 Bicep validation completed successfully!" -ForegroundColor Green