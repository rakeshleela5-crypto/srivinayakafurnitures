#!/bin/bash
# ==============================================================================
# OmniBuild OS™ — Oracle Cloud Always Free 1-Command Setup Script
# Flagship: Sri Vinayaka Furnitures (Godrej Interio Rayagada)
# ==============================================================================

set -e

echo "=========================================================="
echo "👑 Setting up Oracle Cloud 24/7 WhatsApp Gateway..."
echo "📍 Flagship: Sri Vinayaka Furnitures (Rayagada, Odisha)"
echo "=========================================================="

# 1. Update system packages
echo "📦 Step 1/5: Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y curl git ufw iptables-persistent

# 2. Install Docker & Docker Compose
echo "🐳 Step 2/5: Installing Docker Engine & Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm -f get-docker.sh
fi

sudo apt-get install -y docker-compose-plugin

# 3. Fix Oracle Cloud Ubuntu Firewall (Crucial step for OCI!)
echo "🛡️ Step 3/5: Configuring Oracle Cloud Ubuntu Firewall for Port 8080..."
# Oracle Cloud Ubuntu images include strict iptables rules by default
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save || true

# 4. Generate .env file
echo "🔑 Step 4/5: Generating Environment Config..."
if [ ! -f .env ]; then
    PUBLIC_IP=$(curl -s https://api.ipify.org || echo "localhost")
    API_KEY="godrej_rayagada_secret_2026"
    DB_PASS="godrej_rayagada_db_$(openssl rand -hex 4)"
    
    cat <<EOF > .env
SERVER_URL=http://${PUBLIC_IP}:8080
AUTHENTICATION_API_KEY=${API_KEY}
DB_PASSWORD=${DB_PASS}
EOF
    echo "✅ .env generated with Public IP: ${PUBLIC_IP}"
fi

# 5. Launch Evolution API Stack
echo "🚀 Step 5/5: Starting Evolution API, PostgreSQL & Redis containers..."
sudo docker compose -f docker-compose.oracle-cloud.yml up -d

PUBLIC_IP=$(curl -s https://api.ipify.org || echo "your-oracle-ip")

echo ""
echo "=========================================================="
echo "🎉 SUCCESS! Oracle Cloud 24/7 WhatsApp Gateway is LIVE!"
echo "=========================================================="
echo "📍 Gateway Server URL: http://${PUBLIC_IP}:8080"
echo "📍 Instance Name:      srivinayaka_showroom"
echo "📍 Gateway API Key:    godrej_rayagada_secret_2026"
echo ""
echo "👉 NEXT STEPS:"
echo "1. In your Oracle Cloud Web Console, ensure Ingress Rule for Port 8080 is open."
echo "2. Open OmniBuild OS: https://srivinayakafurnitures.rakeshleela5.workers.dev/"
echo "3. Go to Store Settings ⚙️ ➔ WhatsApp Engine ➔ Mode 2."
echo "4. Paste: http://${PUBLIC_IP}:8080 and click 'Test Connection & Pair'."
echo "5. Scan the QR code once on the showroom phone. Done!"
echo "=========================================================="
