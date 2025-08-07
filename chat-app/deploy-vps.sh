#!/bin/bash

# VPS Deployment Script
echo "Deploying Llama 3 Chat App to VPS..."

# Update system
#sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
#curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
#sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/llama3-chat
sudo chown $USER:$USER /var/www/llama3-chat

# Copy application files
cp -r . /var/www/llama3-chat/

# Install dependencies
cd /var/www/llama3-chat
npm install
cd client && npm install && npm run build && cd ..

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
LLAMA3_API_URL=http://chat.csiplai.local/api/chat
EOF

# Start with PM2
pm2 start server.js --name "llama3-chat"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx -y

sudo tee /etc/nginx/sites-available/llama3-chat << EOF
server {
    listen 80;
    server_name chat.csiplai.local;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/llama3-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d chat.csiplai.local

echo "Deployment complete!"
echo "Your app is running at: http://chat.csiplai.local" 