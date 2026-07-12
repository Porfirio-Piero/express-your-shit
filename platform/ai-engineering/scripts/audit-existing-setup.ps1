param(
  [Parameter(Mandatory=$true)]
  [string]$OpenClawRoot
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $OpenClawRoot)) {
  throw "Open Claw root not found: $OpenClawRoot"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $PSScriptRoot "..\reports"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir "existing-setup-audit-$timestamp.md"

$identityNames = @("soul.md","curiosity.md","memory.md","AGENTS.md","agent.md","role.md")
$identityFiles = Get-ChildItem -Path $OpenClawRoot -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $identityNames -contains $_.Name }

$modelFiles = Get-ChildItem -Path $OpenClawRoot -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match "ollama|model|provider|codex" }

$deployFiles = Get-ChildItem -Path $OpenClawRoot -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match "deploy|vercel|docker|compose|pipeline|workflow" }

$lines = @()
$lines += "# Open Claw Existing Setup Audit"
$lines += ""
$lines += "- Root: `$OpenClawRoot`"
$lines += "- Generated: $(Get-Date -Format o)"
$lines += ""
$lines += "## Identity and context files"
foreach ($f in $identityFiles) {
  $rel = $f.FullName.Substring($OpenClawRoot.Length).TrimStart('\')
  $hash = (Get-FileHash $f.FullName -Algorithm SHA256).Hash
  $lines += "- `$rel` — SHA256 `$hash`"
}
$lines += ""
$lines += "## Model and provider-related files"
foreach ($f in $modelFiles) {
  $rel = $f.FullName.Substring($OpenClawRoot.Length).TrimStart('\')
  $lines += "- `$rel`"
}
$lines += ""
$lines += "## Deployment-related files"
foreach ($f in $deployFiles) {
  $rel = $f.FullName.Substring($OpenClawRoot.Length).TrimStart('\')
  $lines += "- `$rel`"
}
$lines += ""
$lines += "## Safety note"
$lines += "No files were modified."

$lines | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Audit written to $outFile"
