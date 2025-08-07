#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run as root"
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="/opt/llama3-chat"
print_status "Creating deployment directory: $DEPLOY_DIR"

sudo mkdir -p $DEPLOY_DIR
sudo chown $USER:$USER $DEPLOY_DIR

# Copy all files
print_status "Copying application files..."
cp -r ../* $DEPLOY_DIR/

# Set permissions
print_status "Setting permissions..."
chmod +x $DEPLOY_DIR/startup/start.sh
chmod +x $DEPLOY_DIR/startup/deploy.sh

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/llama3-chat.service > /dev/null <<EOF
[Unit]
Description=Llama 3 Chat Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR/startup
ExecStart=$DEPLOY_DIR/startup/start.sh start
ExecStop=$DEPLOY_DIR/startup/start.sh stop
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
print_status "Enabling systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable llama3-chat.service

print_status "Deployment completed!"
echo ""
echo "To start the service:"
echo "  sudo systemctl start llama3-chat"
echo ""
echo "To check status:"
echo "  sudo systemctl status llama3-chat"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u llama3-chat -f"
echo ""
echo "To stop the service:"
echo "  sudo systemctl stop llama3-chat" 