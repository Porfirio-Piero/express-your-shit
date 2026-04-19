# Norm's VPS Quick Reference Card

## 🚀 One-Liners

### SSH to Server
```bash
ssh norm@DROPLET_IP
```

### Check Everything
```bash
systemctl status ollama && openclaw gateway status && ollama list
```

### Quick AI Chat
```bash
ollama run llama3.2 "Hello, what's the weather like today?"
```

### Restart Everything
```bash
sudo systemctl restart ollama && openclaw gateway restart
```

---

## 📊 Daily Commands

| Task | Command |
|------|---------|
| Check server health | `uptime && free -h && df -h` |
| List AI models | `ollama list` |
| Update all packages | `sudo apt update && sudo apt upgrade -y` |
| Backup config | `tar -czf backup-$(date +%Y%m%d).tar.gz ~/.openclaw/` |
| View logs | `journalctl -f` |

---

## 🌐 Important URLs

| Service | URL | Local (on VPS) |
|---------|-----|----------------|
| OpenClaw Gateway | http://DROPLET_IP:8080 | http://localhost:8080 |
| Ollama API | http://DROPLET_IP:11434 | http://localhost:11434 |
| Web UI (if installed) | http://DROPLET_IP:3000 | http://localhost:3000 |
| DO Console | https://cloud.digitalocean.com | - |

---

## 💾 Model Management

```bash
# Pull a new model
ollama pull llama3.2

# Remove a model
ollama rm llama3.2

# Run a model interactively
ollama run llama3.2

# Run one-off prompt
ollama run llama3.2 "Your prompt here"

# Copy a model (customize)
ollama cp llama3.2 my-custom-model
```

---

## 🔧 Service Management

```bash
# Ollama
sudo systemctl start ollama
sudo systemctl stop ollama
sudo systemctl restart ollama
sudo systemctl status ollama

# OpenClaw
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway status
openclaw gateway logs
```

---

## 📁 Key Paths

| What | Where |
|------|-------|
| Config | `~/.openclaw/config.yaml` |
| Memory DB | `~/.openclaw/memory.db` |
| Ollama models | `/usr/share/ollama/.ollama/models` |
| Logs | `/var/log/` |
| Projects | `~/projects` |

---

## 🔐 Security Reminders

- ✅ Keep SSH keys secure (`~/.ssh/id_rsa`)
- ✅ Run `sudo apt update && sudo apt upgrade` weekly
- ✅ Monitor with `fail2ban-client status`
- ✅ Check logs with `last` (login history)
- ❌ Never share root password
- ❌ Don't expose Ollama to internet without auth

---

## 💡 Pro Tips

1. **Use `screen` for long tasks:**
   ```bash
   screen -S ai-session
   ollama run llama3.2
   # Ctrl+A, D to detach
   screen -r ai-session  # reattach
   ```

2. **Set up aliases in `~/.bashrc`:**
   ```bash
   alias oll='ollama run llama3.2'
   alias ocl='openclaw'
   alias status='systemctl status ollama && openclaw gateway status'
   ```

3. **Quick disk cleanup:**
   ```bash
   docker system prune -f
   sudo apt autoremove -y
   sudo journalctl --vacuum-size=100M
   ```

---

## 🆘 Emergency

If everything is broken:

```bash
# Nuclear option - restart all
sudo reboot

# Or via Digital Ocean dashboard:
# Droplet → Power → Power Cycle
```

---

*Print this and keep it handy!*
