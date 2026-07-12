param(
  [Parameter(Mandatory=$true)]
  [string]$OpenClawRoot
)

$ErrorActionPreference = "Stop"
$targetRoot = Join-Path $OpenClawRoot "platform\ai-engineering"

if (-not (Test-Path $targetRoot)) {
  Write-Host "Overlay not present."
  exit 0
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $OpenClawRoot "backups\ai-engineering-uninstall-$timestamp"
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
Copy-Item -Path $targetRoot -Destination $backupRoot -Recurse -Force
Remove-Item -Path $targetRoot -Recurse -Force

Write-Host "Overlay removed. Backup retained at $backupRoot"
