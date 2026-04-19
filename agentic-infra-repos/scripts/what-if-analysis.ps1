# What-If Analysis Script
param(
    [string]$ResourceGroupName,
    [string]$Location,
    [string]$Environment,
    [string]$TemplatePath = "infrastructure/main.bicep",
    [string]$ParametersPath = "infrastructure/parameters/$Environment.parameters.json"
)

Write-Host "🔮 Running What-If Analysis for $Environment environment..." -ForegroundColor Yellow

# Validate inputs
if (-not $ResourceGroupName) {
    Write-Error "❌ Resource Group Name is required"
    exit 1
}

if (-not $Environment) {
    Write-Error "❌ Environment is required"
    exit 1
}

# Check if required files exist
if (-not (Test-Path $TemplatePath)) {
    Write-Error "❌ Template file not found: $TemplatePath"
    exit 1
}

if (-not (Test-Path $ParametersPath)) {
    Write-Error "❌ Parameters file not found: $ParametersPath"
    exit 1
}

# Login to Azure
Write-Host "🔐 Authenticating to Azure..." -ForegroundColor Yellow
try {
    az account show | Out-Null
    Write-Host "✅ Already authenticated to Azure" -ForegroundColor Green
} catch {
    Write-Host "❌ Not authenticated to Azure. Please login with 'az login'" -ForegroundColor Red
    exit 1
}

# Run What-If analysis
Write-Host "🔮 Executing What-If analysis..." -ForegroundColor Yellow
try {
    $whatIfResult = az deployment group what-if `
        --resource-group $ResourceGroupName `
        --template-file $TemplatePath `
        --parameters @$ParametersPath `
        --output json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ What-If analysis completed successfully" -ForegroundColor Green
    } else {
        Write-Error "❌ What-If analysis failed"
        exit 1
    }
} catch {
    Write-Error "❌ Error running What-If analysis: $_"
    exit 1
}

# Parse and display results
Write-Host "`n📊 What-If Analysis Results:" -ForegroundColor Cyan
$whatIfJson = $whatIfResult | ConvertFrom-Json

$changes = @{}
$changes["NoChange"] = 0
$changes["Create"] = 0
$changes["Modify"] = 0
$changes["Delete"] = 0
$changes["Ignore"] = 0
$changes["Unknown"] = 0

foreach ($change in $whatIfJson) {
    $changeType = $change.changeType
    if ($changes.ContainsKey($changeType)) {
        $changes[$changeType]++
    } else {
        $changes["Unknown"]++
    }
    
    # Display detailed change information
    switch ($changeType) {
        "Create" {
            Write-Host "🆕 CREATE: $($change.resourceId)" -ForegroundColor Green
        }
        "Modify" {
            Write-Host "✏️  MODIFY: $($change.resourceId)" -ForegroundColor Yellow
        }
        "Delete" {
            Write-Host "❌ DELETE: $($change.resourceId)" -ForegroundColor Red
        }
        "NoChange" {
            Write-Host "✅ NO CHANGE: $($change.resourceId)" -ForegroundColor Gray
        }
        default {
            Write-Host "❓ UNKNOWN: $($change.resourceId)" -ForegroundColor Magenta
        }
    }
    
    # Show property changes for Modify operations
    if ($change.changeType -eq "Modify" -and $change.propertyChanges) {
        foreach ($propChange in $change.propertyChanges) {
            Write-Host "   📝 $($propChange.path): $($propChange.beforeValue) → $($propChange.afterValue)" -ForegroundColor Gray
        }
    }
}

# Summary
Write-Host "`n📈 What-If Analysis Summary:" -ForegroundColor Cyan
foreach ($changeType in $changes.Keys) {
    if ($changes[$changeType] -gt 0) {
        Write-Host "   $($changeType): $($changes[$changeType]) changes" -ForegroundColor White
    }
}

# Save results to file
$outputFile = "what-if-$Environment.json"
$whatIfResult | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "💾 Detailed results saved to: $outputFile" -ForegroundColor Gray

# Check for critical operations
$criticalOperations = @("Delete", "Modify")
$hasCriticalOps = $false

foreach ($changeType in $criticalOperations) {
    if ($changes[$changeType] -gt 0) {
        $hasCriticalOps = $true
        break
    }
}

if ($hasCriticalOps) {
    Write-Host "`n⚠️  WARNING: Critical operations detected!" -ForegroundColor Yellow
    Write-Host "Please review the changes carefully before proceeding with deployment." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ No critical operations detected. Safe to deploy." -ForegroundColor Green
}

Write-Host "`n🎉 What-If analysis completed!" -ForegroundColor Green