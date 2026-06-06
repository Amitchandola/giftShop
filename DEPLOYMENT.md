# GiftShop — Azure VM Deployment Guide

## Prerequisites

- An Azure account with an active subscription
- An Azure VM (Ubuntu 22.04 LTS recommended, minimum B2s — 2 vCPU, 4 GB RAM)
- SSH access to the VM

---

## 1. Create & Configure Azure VM

### Create the VM (Azure Portal)

1. Go to **Azure Portal → Virtual Machines → Create**
2. Choose **Ubuntu Server 22.04 LTS**, size **Standard_B2s** or higher
3. Authentication: **SSH public key** (recommended) or password
4. Under **Networking → Inbound port rules**, allow:
   - **SSH (22)**
   - **HTTP (80)**
   - **HTTPS (443)**
5. Create the VM and note the **Public IP Address**

### Open Custom Ports (NSG)

Go to **VM → Networking → Network Security Group → Inbound security rules**, add:

| Priority | Name        | Port | Protocol | Action |
|----------|-------------|------|----------|--------|
| 300      | Allow-API   | 1000 | TCP      | Allow  |
| 310      | Allow-Client| 5173 | TCP      | Allow  |

> For production, use Nginx reverse proxy on port 80/443 instead of exposing 1000/5173 directly.

---

## 2. SSH into the VM

```bash
ssh -i ~/.ssh/your-key.pem azureuser@<VM_PUBLIC_IP>
```

---

## 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v   # v20.x.x
npm -v    # 10.x.x

# Install MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start & enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod

# Install PM2 globally (keeps app running after terminal closes)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

---

## 4. Upload Project to VM

### Option A: Git clone (if repo is on GitHub)

```bash
cd ~
git clone https://github.com/your-username/giftShop.git
cd giftShop/giftShop-master
```

### Option B: SCP from local machine

```bash
# Run this from your LOCAL machine (PowerShell/CMD)
scp -i ~/.ssh/your-key.pem -r C:\Users\QT924NN\Downloads\giftShop\giftShop-master azureuser@<VM_PUBLIC_IP>:~/giftShop-master
```

---

## 5. Configure Environment Variables

### API `.env`

```bash
cd ~/giftShop-master/api
nano .env
```

```env
PORT=1000
APP_URL=http://<VM_PUBLIC_IP>:1000
MONGO_URI=mongodb://127.0.0.1:27017/giftShop
JWT_SECRET="use-a-strong-random-secret-here"
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

> **Important:** Change `JWT_SECRET` to a strong random string for production.

### Client `.env`

```bash
cd ~/giftShop-master/client
nano .env
```

```env
VITE_API_URL=http://<VM_PUBLIC_IP>:1000
```

Replace `<VM_PUBLIC_IP>` with your actual VM public IP in both files.

---

## 6. Install Node Modules

```bash
# API dependencies
cd ~/giftShop-master/api
npm install

# Client dependencies
cd ~/giftShop-master/client
npm install
```

---

## 7. Build the Frontend

```bash
cd ~/giftShop-master/client
npm run build
```

This creates a `dist/` folder with the production build.

---

## 8. Run API with PM2 (Persistent Process)

PM2 keeps your API running even after you close the terminal or SSH session.

```bash
cd ~/giftShop-master/api

# Start the API server with PM2
pm2 start server.js --name "giftshop-api"

# Verify it's running
pm2 status

# View logs
pm2 logs giftshop-api

# Save the process list so PM2 restarts on reboot
pm2 save

# Set PM2 to start on system boot
pm2 startup
# (Run the command it outputs, e.g.: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u azureuser --hp /home/azureuser)
```

### Useful PM2 Commands

```bash
pm2 status              # Check all running processes
pm2 logs giftshop-api   # View real-time logs
pm2 restart giftshop-api  # Restart the API
pm2 stop giftshop-api     # Stop the API
pm2 delete giftshop-api   # Remove from PM2
pm2 monit               # Live monitoring dashboard
```

---

## 9. Configure Nginx (Reverse Proxy)

Nginx serves the frontend build and proxies API requests, so everything runs on port 80.

```bash
sudo nano /etc/nginx/sites-available/giftshop
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name <VM_PUBLIC_IP>;  # or your domain name

    # Frontend — serve static build
    location / {
        root /home/azureuser/giftShop-master/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API — reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:1000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:1000;
    }
}
```

Enable the site and restart Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/giftshop /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Update Client `.env` for Nginx setup

When using Nginx reverse proxy on port 80, update the client `.env`:

```env
VITE_API_URL=http://<VM_PUBLIC_IP>
```

Then rebuild: `cd ~/giftShop-master/client && npm run build`

---

## 10. Verify Deployment

```bash
# Check all services
sudo systemctl status mongod     # MongoDB
pm2 status                        # API via PM2
sudo systemctl status nginx       # Nginx

# Test API
curl http://localhost:1000         # Should return: "Welcome to the Gift Shop API !!!!!"

# Test from browser
# http://<VM_PUBLIC_IP>            # Frontend (via Nginx)
# http://<VM_PUBLIC_IP>/api/products/all  # API (via Nginx proxy)
```

---

## 11. (Optional) Add SSL with Let's Encrypt

If you have a domain name pointing to the VM:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Update `.env` files to use `https://yourdomain.com` and rebuild the client.

---

## Quick Reference

| Component | Tech         | Port  | Process Manager |
|-----------|-------------|-------|-----------------|
| API       | Express.js  | 1000  | PM2             |
| Frontend  | React/Vite  | 80    | Nginx (static)  |
| Database  | MongoDB     | 27017 | systemd         |
| Proxy     | Nginx       | 80    | systemd         |

## Troubleshooting

```bash
# API not responding
pm2 logs giftshop-api --lines 50

# MongoDB issues
sudo systemctl status mongod
sudo journalctl -u mongod --lines 50

# Nginx errors
sudo tail -50 /var/log/nginx/error.log

# Port conflicts
sudo lsof -i :1000
sudo lsof -i :80

# Restart everything
sudo systemctl restart mongod
pm2 restart giftshop-api
sudo systemctl restart nginx
```
