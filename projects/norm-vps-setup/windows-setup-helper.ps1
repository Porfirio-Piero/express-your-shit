# Windows Setup Helper for Norm's VPS
# Run this in PowerShell to prepare Windows client
# Requires: PowerShell 5.1 or later

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Windows Setup Helper for Norm's VPS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Warning "Some features require admin rights. Run as Administrator if possible."
    Write-Host ""
}

# Function to test SSH
function Test-SSH {
    try {
        $sshVersion = ssh -V 2>&1
        return $true
    }
    catch {
        return $false
    }
}

# Function to test if command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

Write-Host "Step 1/5: Checking SSH Client..." -ForegroundColor Yellow

if (Test-SSH) {
    Write-Host "✓ SSH client is available" -ForegroundColor Green
}
else {
    Write-Host "✗ SSH client not found. Installing OpenSSH..." -ForegroundColor Red
    
    if ($isAdmin) {
        Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
        Write-Host "✓ OpenSSH installed. Restart PowerShell." -ForegroundColor Green
    }
    else {
        Write-Host "Please run as Administrator to install OpenSSH" -ForegroundColor Yellow
        Write-Host "Or install manually: Settings → Apps → Optional Features → OpenSSH Client" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Step 2/5: Checking SSH Key..." -ForegroundColor Yellow

$sshDir = "$env:USERPROFILE\.ssh"
$id_rsa = "$sshDir\id_rsa"
$id_rsa_pub = "$sshDir\id_rsa.pub"

if (Test-Path $id_rsa) {
    Write-Host "✓ SSH private key exists at $id_rsa" -ForegroundColor Green
    
    if (Test-Path $id_rsa_pub) {
        Write-Host "✓ SSH public key exists" -ForegroundColor Green
        Write-Host ""
        Write-Host "Public key content (add this to server):" -ForegroundColor Cyan
        Get-Content $id_rsa_pub
    }
}
else {
    Write-Host "✗ No SSH key found. Generating new key pair..." -ForegroundColor Yellow
    
    if (-not (Test-Path $sshDir)) {
        New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
        Write-Host "Created .ssh directory" -ForegroundColor Green
    }
    
    Write-Host "Generating SSH key pair (ed25519)..." -ForegroundColor Yellow
    ssh-keygen -t ed25519 -C "norm-vps-$(Get-Date -Format 'yyyyMMdd')" -f $id_rsa -N '""'
    
    Write-Host ""
    Write-Host "✓ SSH key generated!" -ForegroundColor Green
    Write-Host "Public key:" -ForegroundColor Cyan
    Get-Content "$id_rsa.pub"
}

Write-Host ""
Write-Host "Step 3/5: Setting up SSH Config..." -ForegroundColor Yellow

$sshConfig = "$sshDir\config"
$normConfig = @"

# Norm's VPS Configuration
# Generated: $(Get-Date)
Host norm-vps
    HostName DROPLET_IP_HERE
    User norm
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3
    StrictHostKeyChecking accept-new
"@

if (Test-Path $sshConfig) {
    $configContent = Get-Content $sshConfig -Raw
    if ($configContent -match "Host norm-vps") {
        Write-Host "✓ norm-vps config already exists in SSH config" -ForegroundColor Green
    }
    else {
        Write-Host "Appending norm-vps config to existing SSH config..." -ForegroundColor Yellow
        Add-Content -Path $sshConfig -Value $normConfig
        Write-Host "✓ Config appended. Edit $sshConfig to set DROPLET_IP" -ForegroundColor Green
    }
}
else {
    Write-Host "Creating new SSH config file..." -ForegroundColor Yellow
    $normConfig | Out-File -FilePath $sshConfig -Encoding utf8
    Write-Host "✓ SSH config created at $sshConfig" -ForegroundColor Green
    Write-Host "⚠ IMPORTANT: Edit the file and replace DROPLET_IP_HERE with actual IP!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4/5: Creating connection helper..." -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$connectScript = @"
@echo off
echo Connecting to Norm's VPS...
ssh norm-vps
if errorlevel 1 (
    echo.
    echo Connection failed. Check:
    echo 1. Is DROPLET_IP set correctly in .ssh\config?
    echo 2. Is the server running? Check Digital Ocean dashboard.
    echo 3. Has the SSH key been added to the server?
    pause
)
"@

$connectScript | Out-File -FilePath "$desktopPath\Connect-to-Norm-VPS.bat" -Encoding ascii
Write-Host "✓ Created desktop shortcut: Connect-to-Norm-VPS.bat" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5/5: Windows Terminal Profile (Optional)..." -ForegroundColor Yellow

$wtSettingsPath = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"

if (Test-Path $wtSettingsPath) {
    Write-Host "Windows Terminal detected!" -ForegroundColor Green
    Write-Host "Add this profile to your settings.json:" -ForegroundColor Cyan
    Write-Host @"
{
    "guid": "{$(New-Guid)}",
    "name": "Norm's VPS",
    "commandline": "ssh norm-vps",
    "icon": "%SystemRoot%\\System32\\shell32.dll,14",
    "startingDirectory": "%USERPROFILE%"
}
"@ -ForegroundColor Gray
}
else {
    Write-Host "Windows Terminal not detected (or using classic console)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit $sshDir\config and set your server's IP address"
Write-Host "2. Copy your public key to the server:"
Write-Host "   ssh-copy-id root@DROPLET_IP" -ForegroundColor Cyan
Write-Host "   (or manually add to server's ~/.ssh/authorized_keys)"
Write-Host "3. Test connection: ssh norm-vps" -ForegroundColor Cyan
Write-Host "4. Use desktop shortcut for easy access"
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "- If ssh command not found: Install OpenSSH Client (Windows Settings)"
Write-Host "- If permission denied: Check SSH key was added to server"
Write-Host "- If connection refused: Check server IP and that droplet is running"
Write-Host ""

# Display current public key for easy copying
Write-Host "Your public key (for server setup):" -ForegroundColor Cyan
if (Test-Path $id_rsa_pub) {
    Get-Content $id_rsa_pub
}
elseif (Test-Path "$id_rsa.pub") {
    Get-Content "$id_rsa.pub"
}

Write-Host ""
Read-Host "Press Enter to exit"
