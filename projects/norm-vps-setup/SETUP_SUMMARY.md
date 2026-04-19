# VPS Setup Summary for Norm - Task 061

**Generated:** 2026-02-19  
**Status:** Ready for Implementation  
**Location:** `projects/norm-vps-setup/`

---

## 📦 What's Included

This package contains everything needed to set up Norm's Digital Ocean VPS:

| File | Purpose |
|------|---------|
| `README.md` | Complete step-by-step guide |
| `setup-droplet.sh` | Server automation script (run on VPS) |
| `openclaw-config.yaml` | Pre-configured OpenClaw settings |
| `docker-compose.yaml` | Alternative Docker deployment |
| `credentials.template.md` | Template for documenting access |
| `troubleshoot.md` | Common issues and solutions |
| `quick-ref.md` | One-page quick reference |
| `windows-setup-helper.ps1` | Windows client setup script |

---

## ✅ Checklist Status

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Sign up for Digital Ocean | 🔶 Manual | Requires credit card, human verification |
| 2 | Create a droplet (VPS) | 🔶 Manual | Use DO dashboard, Ubuntu 22.04 LTS |
| 3 | SSH into the server | 🔶 Manual | Use credentials from DO |
| 4 | Install OpenClaw | ✅ Automated | Run `setup-droplet.sh` |
| 5 | Install Ollama | ✅ Automated | Included in script |
| 6 | Configure base agents | ✅ Automated | Config file provided |
| 7 | Document credentials | ✅ Template | Fill in credentials.template.md |

**Legend:**
- ✅ = Fully automated with provided files
- 🔶 = Requires manual action (account creation, etc.)

---

## 🚀 Quick Start (For P or Norm)

### Phase 1: Digital Ocean (Manual, ~15 minutes)

1. Go to https://www.digitalocean.com/
2. Sign up for new account (use referral for credit)
3. Create droplet:
   - **OS:** Ubuntu 22.04 LTS
   - **Size:** $6/month (1GB RAM / 25GB SSD)
   - **Region:** NYC, SF, or closest to Norm
   - **Auth:** SSH Key or Password
   - **Hostname:** `norm-openclaw-vps`
4. **SAVE THE IP ADDRESS** displayed after creation
5. Copy the SSH key/public key for later

### Phase 2: Windows Client Setup (~5 minutes)

On Windows machine, run in PowerShell:

```powershell
# Download and run Windows helper
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Piero-Porfirio/openclaw-workspace/main/projects/norm-vps-setup/windows-setup-helper.ps1" -OutFile "$env:USERPROFILE\Downloads\setup-helper.ps1"

# Run it
& "$env:USERPROFILE\Downloads\setup-helper.ps1"
```

Or manually:
1. Generate SSH key: `ssh-keygen -t ed25519`
2. Edit `~/.ssh/config` to add server IP
3. Copy public key to server

### Phase 3: Server Setup (~10 minutes)

SSH into the server and run:

```bash
# Download setup script
curl -O https://raw.githubusercontent.com/Piero-Porfirio/openclaw-workspace/main/projects/norm-vps-setup/setup-droplet.sh

# Run it
chmod +x setup-droplet.sh
sudo ./setup-droplet.sh
```

**This automatically:**
- Updates system packages
- Installs Docker
- Installs Ollama
- Installs OpenClaw
- Creates `norm` user
- Configures firewall
- Downloads AI models (llama3.2, llama3.2:1b, nomic-embed-text)

### Phase 4: Configuration (~5 minutes)

```bash
# Copy config file
mkdir -p ~/.openclaw
curl -o ~/.openclaw/config.yaml https://raw.githubusercontent.com/Piero-Porfirio/openclaw-workspace/main/projects/norm-vps-setup/openclaw-config.yaml

# Start OpenClaw
openclaw gateway start

# Verify
openclaw gateway status
ollama list
```

### Phase 5: Documentation

1. Copy `credentials.template.md` to secure location
2. Fill in:
   - Droplet IP address
   - SSH credentials
   - Digital Ocean login
   - Any API keys
3. Store in password manager or secure file

---

## 📋 What Norm Gets

After setup, Norm will have:

### Services
- **OpenClaw Gateway** at `http://IP:8080` - AI assistant interface
- **Ollama API** at `http://IP:11434` - LLM backend
- **SSH Access** for management

### AI Models Pre-installed
- `llama3.2` - General purpose (4GB)
- `llama3.2:1b` - Fast/efficient (1GB)
- `nomic-embed-text` - Embeddings

### Features
- Web interface for chatting with AI
- API access for integrations
- Persistent memory (saves conversations)
- File operations and tool access
- Multiple agent configurations

---

## 💰 Costs

| Item | Cost |
|------|------|
| Digital Ocean Droplet ($6/mo tier) | $6/month |
| Bandwidth (1TB included) | $0 |
| Storage (25GB included) | $0 |
| OpenClaw | Free |
| Ollama | Free |
| **Total Monthly** | **$6 USD** |

**Free Tier:**
- Digital Ocean offers $200 credit for 60 days (with referral)
- After credit: ~$6/month

---

## 🔐 Security Considerations

### ✅ Implemented
- Firewall (UFW) configured
- Non-root user (`norm`) created
- SSH key authentication ready
- Fail2ban installed
- OpenClaw confirmation prompts enabled

### ⚠️ Norm Should Do
- [ ] Set strong password for `norm` user
- [ ] Add SSH key and disable password login
- [ ] Enable 2FA on Digital Ocean account
- [ ] Keep API keys secure
- [ ] Regular updates: `sudo apt update && sudo apt upgrade`

---

## 🎯 Usage Examples

### Connect to VPS
```powershell
# Windows
ssh norm@DROPLET_IP
# Or if config set up:
ssh norm-vps
```

### Chat with AI
```bash
# Direct Ollama
ollama run llama3.2

# Via OpenClaw
openclaw chat "What's the weather like?"
```

### Check Status
```bash
# All services
systemctl status ollama
openclaw gateway status

# Resources
free -h
df -h
top
```

---

## 📞 Support Resources

| Issue | Resource |
|-------|----------|
| Can't connect | `troubleshoot.md` → "Cannot SSH" |
| Service won't start | `troubleshoot.md` → Service sections |
| Out of memory | `troubleshoot.md` → Memory Issues |
| General help | This file, `README.md` |
| Quick commands | `quick-ref.md` |

---

## 📝 Next Steps (After Setup)

1. **Test everything works**
   - SSH connection
   - OpenClaw web interface
   - AI model response

2. **Personalize**
   - Edit `~/.openclaw/config.yaml` for preferences
   - Pull additional models if needed
   - Set up any integrations

3. **Optional Enhancements**
   - Install Open WebUI: `docker-compose up -d` in project folder
   - Set up HTTPS (reverse proxy with nginx + Let's Encrypt)
   - Configure WhatsApp/Telegram integration
   - Add more AI models

4. **Maintenance**
   - Weekly: `sudo apt update && sudo apt upgrade`
   - Monthly: Check disk space, review logs
   - As needed: Update models, backup configs

---

## ✅ Completion Verification

To verify setup is complete, run:

```bash
# On VPS
systemctl is-active ollama && echo "✓ Ollama running"
openclaw gateway status | grep -q "running" && echo "✓ OpenClaw running"
curl -s http://localhost:11434/api/tags | grep -q "llama" && echo "✓ Models available"
```

All three should return ✓

---

**Questions?** See `README.md` for detailed instructions or `troubleshoot.md` for issues.

**Setup by:** P for Norm 🍕
