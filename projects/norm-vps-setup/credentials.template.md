# Norm's VPS Credentials and Access Information

**⚠️ CRITICAL: Keep this file secure and private! ⚠️**

**Server:** Digital Ocean VPS  
**Hostname:** norm-openclaw-vps  
**Setup Date:** _____________  
**Setup By:** _____________

---

## 🔐 Server Access

### Server IP Address
```
DROPLET_IP = ___.___.___.___
```

### SSH Access

**Option 1: SSH Key (Recommended)**
```bash
ssh norm@DROPLET_IP
```
- Private Key Location: `~/.ssh/id_rsa`
- Public Key Added: ✅ / ⬜

**Option 2: Password**
```bash
ssh root@DROPLET_IP
```
- Root Password: _________________
- Norm User Password: _________________

### SSH Config (Add to ~/.ssh/config)
```
Host norm-vps
    HostName DROPLET_IP
    User norm
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

---

## 🌐 Web Access

### OpenClaw Gateway
- **URL:** http://DROPLET_IP:8080
- **Status:** Check with `openclaw gateway status`

### Ollama API
- **URL:** http://DROPLET_IP:11434
- **Health Check:** http://DROPLET_IP:11434/api/tags

---

## 📊 Service Status Commands

```bash
# Check OpenClaw
openclaw gateway status
openclaw gateway logs

# Check Ollama
systemctl status ollama
ollama list

# Check all services
systemctl status --all | grep -E "(openclaw|ollama)"

# View logs
journalctl -u ollama -f
```

---

## 🗝️ API Keys and Tokens

### Digital Ocean
- **Account Email:** _________________
- **API Token:** `dop_v1_xxxxxxxxxxxxxxxx`
- **Token Location:** ~/.digitalocean/token

### OpenClaw (if any)
- **API Key:** _________________

### External Services (if configured)

**Brave Search API** (for web_search)
- Key: `BSA___________________________________________`

**Other Services:**
- Service: _________________
- Key: _________________

---

## 📁 Important Paths

| Purpose | Path |
|---------|------|
| OpenClaw Config | `~/.openclaw/config.yaml` |
| OpenClaw Memory | `~/.openclaw/memory.db` |
| Ollama Models | `/usr/share/ollama/.ollama/models` |
| Projects | `~/projects` |
| Logs | `/var/log/openclaw/` |
| SSH Keys | `~/.ssh/` |

---

## 🔄 Backup Commands

```bash
# Backup OpenClaw config
tar -czf openclaw-backup-$(date +%Y%m%d).tar.gz ~/.openclaw/

# Backup Ollama models (large!)
tar -czf ollama-models-backup-$(date +%Y%m%d).tar.gz /usr/share/ollama/.ollama/models/

# Full user backup
tar -czf norm-home-backup-$(date +%Y%m%d).tar.gz ~/
```

---

## 🆘 Emergency Recovery

### Reset OpenClaw
```bash
openclaw gateway stop
rm -rf ~/.openclaw/config.yaml
# Restore from backup or reconfigure
```

### Restart All Services
```bash
sudo systemctl restart ollama
openclaw gateway restart
```

### Regain Root Access (if locked out)
1. Access via Digital Ocean console (web)
2. Login with root credentials
3. Check/fix SSH config: `nano /etc/ssh/sshd_config`
4. Restart SSH: `systemctl restart sshd`

---

## 📞 Support Contacts

- **P (Setup Helper):** _________________
- **Digital Ocean Support:** https://cloud.digitalocean.com/support
- **OpenClaw Community:** https://github.com/openclaw/community
- **Ollama Docs:** https://github.com/ollama/ollama

---

## 📝 Notes

**Cost:**
- Droplet: $6/month
- Bandwidth: Included up to 1TB
- Storage: Included 25GB

**Next Renewal:** _________________

**Important Notes:**
- 
- 
- 

---

**Last Updated:** _________________
