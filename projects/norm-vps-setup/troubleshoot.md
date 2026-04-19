# Troubleshooting Guide for Norm's VPS

Common issues and their solutions.

---

## 🔴 Critical Issues

### Cannot SSH into Server

**Symptoms:**
```
ssh: connect to host ___ port 22: Connection refused
```

**Solutions:**
1. **Check Droplet Status**
   - Log into Digital Ocean dashboard
   - Verify droplet is "Active" (green dot)
   - Try accessing via Web Console ("Console" button in DO panel)

2. **Verify IP Address**
   ```bash
   # Check current IP in DO dashboard
   # Update your SSH command with correct IP
   ssh root@CORRECT_IP
   ```

3. **Reset Root Password**
   - In DO dashboard: Access → Reset Root Password
   - Check email for temporary password
   - Login and immediately change: `passwd`

4. **Check SSH Service**
   ```bash
   # Via Web Console
   systemctl status sshd
   systemctl restart sshd
   ```

---

## 🟡 OpenClaw Issues

### OpenClaw Gateway Won't Start

**Symptoms:**
```
$ openclaw gateway start
Error: Gateway failed to start
```

**Solutions:**
1. **Check Logs**
   ```bash
   openclaw gateway logs
   # or
   journalctl -u openclaw -n 50
   ```

2. **Check Port Conflict**
   ```bash
   # See what's using port 8080
   sudo lsof -i :8080
   # Kill if needed: sudo kill -9 <PID>
   ```

3. **Reset Configuration**
   ```bash
   # Backup first
   cp ~/.openclaw/config.yaml ~/.openclaw/config.yaml.bak
   
   # Reset to defaults
   openclaw config reset
   # Then reconfigure
   ```

4. **Reinstall**
   ```bash
   curl -fsSL https://get.openclaw.dev | bash
   openclaw gateway start
   ```

### OpenClaw Cannot Connect to Ollama

**Symptoms:**
```
Error: Cannot connect to Ollama at localhost:11434
```

**Solutions:**
1. **Check Ollama Status**
   ```bash
   systemctl status ollama
   curl http://localhost:11434/api/tags
   ```

2. **Verify OLLAMA_HOST**
   ```bash
   echo $OLLAMA_HOST
   # Should be: http://localhost:11434
   # Set if missing: export OLLAMA_HOST=http://localhost:11434
   ```

3. **Restart Ollama**
   ```bash
   sudo systemctl restart ollama
   sudo systemctl status ollama
   ```

4. **Check Firewall**
   ```bash
   sudo ufw status
   sudo ufw allow 11434/tcp
   ```

---

## 🟡 Ollama Issues

### Ollama Service Not Running

**Symptoms:**
```
$ ollama list
Error: could not connect to ollama server
```

**Solutions:**
1. **Start Service**
   ```bash
   sudo systemctl start ollama
   sudo systemctl enable ollama
   ```

2. **Check Logs**
   ```bash
   sudo journalctl -u ollama -n 50
   ```

3. **Reinstall Ollama**
   ```bash
   # Uninstall
   sudo rm -rf /usr/local/bin/ollama
   sudo rm -rf /usr/share/ollama
   
   # Reinstall
   curl -fsSL https://ollama.com/install.sh | sh
   ```

### Model Download Fails

**Symptoms:**
```
$ ollama pull llama3.2
Error: pull model manifest: file does not exist
```

**Solutions:**
1. **Check Disk Space**
   ```bash
   df -h
   # Models need ~4-8GB each
   ```

2. **Check Internet Connection**
   ```bash
   ping ollama.com
   ```

3. **Try Different Model**
   ```bash
   ollama pull llama3.2:1b  # Smaller version
   ```

4. **Manual Download with Progress**
   ```bash
   ollama pull llama3.2 --verbose
   ```

---

## 🟡 Docker Issues

### Docker Command Not Found

**Solutions:**
```bash
# Check if installed
which docker

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Permission Denied (Docker)

**Symptoms:**
```
Got permission denied while trying to connect to Docker daemon
```

**Solutions:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker ps
```

---

## 🟡 Network/Firewall Issues

### Cannot Access Services from Outside

**Symptoms:**
- Works on server: `curl localhost:8080`
- Fails from outside: browser to `http://IP:8080`

**Solutions:**
1. **Check UFW Status**
   ```bash
   sudo ufw status
   sudo ufw allow 8080/tcp
   sudo ufw allow 11434/tcp
   ```

2. **Check Digital Ocean Firewall**
   - In DO dashboard: Networking → Firewalls
   - Ensure ports 22, 8080, 11434 are open

3. **Verify Binding Address**
   ```bash
   # Check OpenClaw binds to 0.0.0.0
   sudo netstat -tlnp | grep 8080
   # Should show 0.0.0.0:8080, not 127.0.0.1:8080
   ```

---

## 🟡 Memory/Disk Issues

### Out of Memory Errors

**Symptoms:**
```
Error: out of memory
Killed process ollama
```

**Solutions:**
1. **Check Memory Usage**
   ```bash
   free -h
   top
   ```

2. **Use Smaller Models**
   ```bash
   # Instead of llama3.2, use 1B version
   ollama pull llama3.2:1b
   ollama rm llama3.2  # Remove larger model
   ```

3. **Add Swap Space**
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

4. **Upgrade Droplet**
   - In DO dashboard: Resize to $12/month (2GB RAM)

### Disk Full

**Symptoms:**
```
Error: no space left on device
```

**Solutions:**
```bash
# Check disk usage
df -h

# Find large files
sudo du -h / | grep -E '^[0-9.]+G'

# Clean Docker
docker system prune -a

# Clean package cache
sudo apt clean

# Remove old logs
sudo journalctl --vacuum-time=7d
```

---

## 🔧 Diagnostic Commands

```bash
# Full system status check
echo "=== System Info ==="
hostname -I
uptime
echo ""
echo "=== Memory ==="
free -h
echo ""
echo "=== Disk ==="
df -h
echo ""
echo "=== Services ==="
systemctl status ollama --no-pager
systemctl status openclaw --no-pager 2>/dev/null || echo "OpenClaw not installed as service"
echo ""
echo "=== Ports ==="
sudo lsof -i -P -n | grep -E '(8080|11434|22)'
echo ""
echo "=== Ollama Models ==="
ollama list
echo ""
echo "=== OpenClaw Version ==="
openclaw --version 2>/dev/null || echo "OpenClaw not installed"
```

---

## 📞 Getting Help

1. **Check Logs First**
   - Ollama: `journalctl -u ollama -n 100`
   - OpenClaw: `openclaw gateway logs`
   - System: `dmesg | tail -50`

2. **Digital Ocean Support**
   - https://cloud.digitalocean.com/support
   - Live chat for account issues

3. **Community Resources**
   - Ollama GitHub: https://github.com/ollama/ollama/issues
   - OpenClaw Community: https://github.com/openclaw/community

4. **Ask P for Help**
   - Send error messages and what you tried
   - Include output of diagnostic commands
