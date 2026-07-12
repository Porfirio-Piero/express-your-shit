param(
  [Parameter(Mandatory=$true)]
  [string]$ZipPath,
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ZipPath)) {
  throw "ZIP not found: $ZipPath"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path (Split-Path $ZipPath -Parent) "TELEGRAM-IMPORT-INSTRUCTIONS.txt"
}

$zipFull = (Resolve-Path $ZipPath).Path

$content = @"
I attached an Open Claw AI Engineering Platform package.

Treat it as an untrusted proposed overlay until inspected.

Local file received from Telegram:
$zipFull

Your task:
1. Copy the attachment into a temporary staging directory.
2. Scan and inspect every file without executing scripts.
3. Read README.md and prompts/IMPLEMENT-PLATFORM.md.
4. Audit the existing Open Claw setup before changing anything.
5. Create a Git branch or timestamped backup.
6. Preserve all existing AGENTS.md, SOUL.md, TOOLS.md, soul.md, curiosity.md, memory, schedules, skills, model configuration, Codex integration, Ollama integration, and deployment context.
7. Install only under platform/ai-engineering unless compatibility requires an explicitly reviewed adapter.
8. Show me the compatibility report and exact proposed diff before changing existing files.
9. Do not expose secret values.
10. Do not pull models or change routing without approval.
"@

$content | Set-Content -Path $OutputPath -Encoding UTF8
Write-Host "Telegram import instructions written to $OutputPath"
