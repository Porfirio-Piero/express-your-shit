param(
  [Parameter(Mandatory=$true)]
  [string]$OpenClawRoot,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $OpenClawRoot)) {
  throw "Open Claw root not found: $OpenClawRoot"
}

$sourceRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$targetRoot = Join-Path $OpenClawRoot "platform\ai-engineering"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

if (Test-Path $targetRoot) {
  if (-not $Force) {
    throw "Target already exists: $targetRoot. Re-run with -Force only after reviewing differences."
  }
  $backupRoot = Join-Path $OpenClawRoot "backups\ai-engineering-$timestamp"
  New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
  Copy-Item -Path $targetRoot -Destination $backupRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

$exclude = @("scripts","reports")
Get-ChildItem -Path $sourceRoot | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $targetRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path (Join-Path $targetRoot "bindings") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $targetRoot "project-bindings") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $targetRoot "reports") | Out-Null

$installRecord = @"
# Installation Record

- Installed: $(Get-Date -Format o)
- Source: $sourceRoot
- Target: $targetRoot
- Mode: non-destructive overlay
- Existing files outside target modified: none
"@

$installRecord | Set-Content -Path (Join-Path $targetRoot "INSTALLATION-RECORD.md") -Encoding UTF8
Write-Host "Overlay installed to $targetRoot"
Write-Host "No existing files outside the platform namespace were modified."
