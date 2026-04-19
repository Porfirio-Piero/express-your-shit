#!/bin/bash
# OpenClaw + Ollama VPS Setup Script for Norm
# Run this on the Digital Ocean droplet after SSH login
# Usage: sudo bash setup-droplet.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NORM_USER="norm"
OLLAMA_PORT=11434
OPENCLAW_PORT=8080

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  OpenClaw + Ollama VPS Setup Script${NC}"
echo -e "${GREEN}  For: Norm (P's Paisan)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1/7: Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git python3 python3-pip python3-venv \
    apt-transport-https ca-certificates gnupg \
    software-properties-common ufw fail2ban

echo -e "${YELLOW}Step 2/7: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker root
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${GREEN}Docker already installed${NC}"
fi

echo -e "${YELLOW}Step 3/7: Installing Ollama...${NC}"
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    
    # Configure Ollama to listen on all interfaces (for remote access if needed)
    mkdir -p /etc/systemd/system/ollama.service.d
    cat > /etc/systemd/system/ollama.service.d/environment.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF
    
    systemctl daemon-reload
    systemctl enable ollama
    systemctl start ollama
    
    echo -e "${GREEN}Ollama installed and started${NC}"
else
    echo -e "${GREEN}Ollama already installed${NC}"
fi

echo -e "${YELLOW}Step 4/7: Installing OpenClaw...${NC}"
if ! command -v openclaw &> /dev/null; then
    # Install OpenClaw
    curl -fsSL https://get.openclaw.dev | bash
    
    # Add to PATH for current session
    export PATH="$PATH:/usr/local/bin"
    
    echo -e "${GREEN}OpenClaw installed successfully${NC}"
else
    echo -e "${GREEN}OpenClaw already installed${NC}"
fi

echo -e "${YELLOW}Step 5/7: Creating user 'norm'...${NC}"
if ! id "$NORM_USER" &>/dev/null; then
    adduser --gecos "" --disabled-password "$NORM_USER"
    usermod -aG sudo "$NORM_USER"
    usermod -aG docker "$NORM_USER"
    echo -e "${GREEN}User 'norm' created${NC}"
    echo -e "${YELLOW}NOTE: Set password for norm with: passwd norm${NC}"
else
    echo -e "${GREEN}User 'norm' already exists${NC}"
fi

echo -e "${YELLOW}Step 6/7: Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp  # OpenClaw Gateway
ufw allow 11434/tcp  # Ollama API

echo -e "${YELLOW}Enabling firewall...${NC}"
echo "y" | ufw enable

echo -e "${YELLOW}Step 7/7: Pulling AI models...${NC}"
echo -e "${YELLOW}Downloading llama3.2:1b (lightweight)...${NC}"
ollama pull llama3.2:1b

echo -e "${YELLOW}Downloading llama3.2 (standard)...${NC}"
ollama pull llama3.2

echo -e "${YELLOW}Downloading nomic-embed-text (embeddings)...${NC}"
ollama pull nomic-embed-text

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Installed Models:"
ollama list
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Set password for norm user: passwd norm"
echo "2. Configure SSH key for norm (optional but recommended)"
echo "3. Start OpenClaw Gateway: openclaw gateway start"
echo "4. Check status: openclaw gateway status"
echo ""
echo -e "${YELLOW}Services:${NC}"
echo "- Ollama API: http://$(hostname -I | awk '{print $1}'):11434"
echo "- OpenClaw Gateway: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo -e "${GREEN}Save this information for Norm!${NC}"
