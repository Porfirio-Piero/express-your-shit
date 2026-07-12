param(
  [Parameter(Mandatory=$true)]
  [string]$OpenClawRoot
)

$ErrorActionPreference = "Stop"
$platformRoot = Join-Path $OpenClawRoot "platform\ai-engineering"
$bindingsRoot = Join-Path $platformRoot "bindings"
New-Item -ItemType Directory -Force -Path $bindingsRoot | Out-Null

$agentDirs = Get-ChildItem -Path $OpenClawRoot -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object {
    Test-Path (Join-Path $_.FullName "soul.md") -or
    Test-Path (Join-Path $_.FullName "curiosity.md") -or
    Test-Path (Join-Path $_.FullName "AGENT.md")
  }

foreach ($dir in $agentDirs) {
  if ($dir.FullName.StartsWith($platformRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    continue
  }

  $safeName = ($dir.Name -replace '[^A-Za-z0-9_-]','-').ToLower()
  $bindingFile = Join-Path $bindingsRoot "$safeName.yaml"

  $soul = Join-Path $dir.FullName "soul.md"
  $curiosity = Join-Path $dir.FullName "curiosity.md"
  $agent = Join-Path $dir.FullName "AGENT.md"

  $content = @()
  $content += "agent: $($dir.Name)"
  $content += "source_directory: `"$($dir.FullName)`""
  $content += "preserve:"
  if (Test-Path $soul) { $content += "  soul: `"$soul`"" }
  if (Test-Path $curiosity) { $content += "  curiosity: `"$curiosity`"" }
  if (Test-Path $agent) { $content += "  role: `"$agent`"" }
  $content += "apply:"
  $content += "  standards:"
  $content += "    - platform/ai-engineering/standards/PRODUCT-PRINCIPLES.md"
  $content += "    - platform/ai-engineering/standards/ENGINEERING-STANDARDS.md"
  $content += "  skills:"
  $content += "    - platform/ai-engineering/skills/context-preservation/SKILL.md"
  $content += "overwrite_identity: false"

  $content | Set-Content -Path $bindingFile -Encoding UTF8
}

Write-Host "Generated bindings in $bindingsRoot"
