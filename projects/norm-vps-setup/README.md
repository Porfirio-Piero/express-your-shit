# Norm's OpenClaw VPS Setup Guide

**Project:** task-061 - Digital Ocean VPS Setup for Norm  
**Created:** 2026-02-19  
**Status:** Ready for Implementation

---

## 📋 Overview

This package contains everything needed to set up a Digital Ocean VPS with OpenClaw + Ollama for Norm.

## 🚀 Quick Start (7 Steps)

### Step 1: Sign Up for Digital Ocean

1. Visit [Digital Ocean](https://www.digitalocean.com/)
2. Click "Sign Up" and create an account
3. **Use referral link for $200 credit:** `https://m.do.co/c/[REFERRAL_CODE]`
   - (Optional - search for current referral codes online)
4. Add payment method (credit card or PayPal)
5. Verify email

### Step 2: Create a Droplet (VPS)

**Recommended Configuration:**
- **OS:** Ubuntu 22.04 LTS (x64)
- **Plan:** Basic (Shared CPU)
- **Size:** $4/month (512MB RAM / 1 CPU / 10GB SSD) - minimum
  - OR $6/month (1GB RAM / 1 CPU / 25GB SSD) - recommended for Ollama
- **Region:** Choose closest to Norm (e.g., NYC, SF, London)
- **Authentication:** SSH Key (recommended) or Password
- **Hostname:** `norm-openclaw-vps`

**Steps:**
1. Log into Digital Ocean dashboard
2. Click "Create" → "Droplets"
3. Select Ubuntu 22.04 LTS
4. Choose Basic plan, select $6/month size
5. Choose datacenter region
6. Under "Authentication":
   - Select "SSH Key" or "Password"
   - If SSH Key: Add your public key (`~/.ssh/id_rsa.pub`)
   - If Password: Create a strong password
7. Set hostname: `norm-openclaw-vps`
8. Click "Create Droplet"
9. **SAVE THE IP ADDRESS** shown after creation

### Step 3: SSH Into the Server

**Option A: SSH Key (Recommended)**
```powershell
# In PowerShell on Windows
ssh root@YOUR_DROPLET_IP
```

**Option B: Password**
```powershell
ssh root@YOUR_DROPLET_IP
# Enter password when prompted
```

### Step 4: Run OpenClaw Installation Script

Once SSH'd into the server, run:

```bash
# Download and run the installer
curl -fsSL https://raw.githubusercontent.com/openclaw/install/main/install.sh | bash

# Or use the local script provided:
wget https://raw.githubusercontent.com/openclaw/install/main/install.sh
chmod +x install.sh
sudo ./install.sh
```

**Alternative: Manual Installation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git python3 python3-pip docker.io docker-compose

# Install OpenClaw Gateway
curl -fsSL https://get.openclaw.dev | bash

# Start OpenClaw Gateway
openclaw gateway start
```

### Step 5: Install Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
sudo systemctl start ollama
sudo systemctl enable ollama

# Verify installation
ollama --version
```

**Pull Recommended Models:**
```bash
# Pull a lightweight model for testing
ollama pull llama3.2:1b

# Pull a better model for general use
ollama pull llama3.2

# List downloaded models
ollama list
```

### Step 6: Configure OpenClaw + Ollama Integration

```bash
# Configure OpenClaw to use Ollama
openclaw configure --section llm

# Set Ollama URL (local)
export OLLAMA_HOST=http://localhost:11434

# Test Ollama connection
openclaw test ollama
```

**Create Default Configuration:**
```bash
# Create config directory
mkdir -p ~/.openclaw

# Copy the provided config
cp /path/to/norm-config.yaml ~/.openclaw/config.yaml
```

### Step 7: Start Services and Verify

```bash
# Start OpenClaw Gateway
openclaw gateway start

# Check status
openclaw gateway status

# Verify Ollama
ollama list

# Test AI interaction
openclaw chat "Hello, this is Norm's VPS!"
```

---

## 🔐 Security Setup

### 1. Create Non-Root User (Recommended)

```bash
# On the VPS
adduser norm
usermod -aG sudo norm

# Switch to norm user
su - norm

# Setup SSH key for norm (copy from local)
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key
chmod 600 ~/.ssh/authorized_keys
```

### 2. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 11434/tcp  # Ollama API (if remote access needed)
sudo ufw enable
```

### 3. Disable Root Password Login (After SSH key setup)

```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

---

## 📁 File Structure

```
norm-vps-setup/
├── README.md                 # This file
├── setup-droplet.sh         # Server setup automation
├── openclaw-config.yaml     # OpenClaw configuration template
├── docker-compose.yaml      # Docker compose for services
├── credentials.template.md  # Credentials documentation
└── troubleshoot.md          # Common issues and fixes
```

---

## 📝 Post-Setup Checklist

- [ ] Digital Ocean account created
- [ ] Droplet created and running
- [ ] SSH access verified
- [ ] OpenClaw installed and running
- [ ] Ollama installed and running
- [ ] At least one AI model downloaded
- [ ] OpenClaw + Ollama integration tested
- [ ] Firewall configured
- [ ] Non-root user created (optional)
- [ ] Credentials documented

---

## 🔗 Useful Links

- Digital Ocean: https://cloud.digitalocean.com
- OpenClaw Docs: https://docs.openclaw.dev
- Ollama Models: https://ollama.com/library
- Ubuntu 22.04 LTS: https://ubuntu.com/server/docs

---

## 🆘 Support

If issues arise:
1. Check `troubleshoot.md` in this directory
2. Check Digital Ocean status: https://status.digitalocean.com
3. OpenClaw community: https://github.com/openclaw/community

---

**Next Steps:** See `credentials.template.md` for documenting access info.
