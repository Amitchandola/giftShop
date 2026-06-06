# GiftShop — GoDaddy cPanel Deployment Guide

Deploy the full MERN stack app on GoDaddy hosting with a custom domain.

---

## App Architecture (Based on Code Review)

| Component | Tech | Key Details |
|-----------|------|-------------|
| **API** | Express 5 (ES Modules) | Port from `process.env.PORT`, routes prefixed `/api/` |
| **Client** | React 19 + Vite 8 + Tailwind 4 | Builds to `client/dist/` |
| **Database** | MongoDB (Mongoose 9) | Connection via `process.env.MONGO_URI` |
| **Auth** | JWT | Token in `Auth` header, secret from `process.env.JWT_SECRET` |
| **Images** | Base64 in DB (multer memoryStorage) | Product images stored as data URIs — NO file system needed |
| **Uploads** | Disk storage (`uploads/` folder) | Only for payment screenshots |
| **Email** | Nodemailer (Gmail) | Uses `process.env.EMAIL_USER` and `process.env.EMAIL_PASS` |
| **Package Type** | ES Modules (`"type": "module"`) | Uses `import/export` syntax |

### Environment Variables Required (API)

```env
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_long_random_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
APP_URL=https://yourdomain.com
```

---

## Prerequisites

- GoDaddy **Web Hosting** plan with **Node.js support** (Business/Ultimate tier or VPS)
- GoDaddy **Domain** purchased
- **MongoDB Atlas** account (free tier) — GoDaddy doesn't have MongoDB
- **Gmail App Password** for order notification emails
- **GitHub** account (for easy deployment)

---

## Step 1: Setup MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Create a **Free Cluster** (M0 Sandbox, choose nearest region)
3. **Database Access** → Add user with username/password
4. **Network Access** → Add `0.0.0.0/0` (allow all — required for shared hosting)
5. **Connect** → "Connect your application" → Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/giftShop?retryWrites=true&w=majority
   ```

---

## Step 2: Setup Gmail App Password

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to **App passwords** → Generate one for "Mail"
4. Copy the 16-character password (this is your `EMAIL_PASS`)

---

## Step 3: Push Code to GitHub

```bash
cd c:\Users\QT924NN\Downloads\giftShop\giftShop-master

# Initialize git
git init

# Create .gitignore
```

Create a `.gitignore` file in the project root:

```gitignore
node_modules/
api/.env
client/.env
client/.env.production
client/dist/
api/uploads/*.jpg
api/uploads/*.png
api/uploads/*.jpeg
!api/uploads/.gitkeep
.DS_Store
```

Then push:

```bash
git add .
git commit -m "Initial commit - GiftShop MERN app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/giftShop.git
git push -u origin main
```

---

## Step 4: Build the React Client

On your local machine:

```bash
cd client
```

Create `client/.env.production`:

```env
VITE_API_URL=https://yourdomain.com
```

> **Important**: Your AppState.jsx appends `/api` to this URL already:
> ```js
> const url = `${import.meta.env.VITE_API_URL}/api`;
> ```
> So set `VITE_API_URL` to just the domain, NOT `https://yourdomain.com/api`

Build:

```bash
npm install
npm run build
```

This produces `client/dist/` with `index.html` + `assets/` folder.

---

## Step 5: Login to GoDaddy cPanel

1. Go to [GoDaddy](https://www.godaddy.com) → **My Products** → **Web Hosting** → **Manage**
2. Click **cPanel Admin**
3. (Or access directly: `https://yourdomain.com/cpanel` or `https://yourdomain.com:2083`)

---

## Step 6: Deploy via cPanel Git (Recommended)

### Clone from GitHub

1. In cPanel → **Git™ Version Control** (under Files section)
2. Click **Create**
3. Fill in:
   - **Clone URL**: `https://github.com/YOUR_USERNAME/giftShop.git`
   - **Repository Path**: `/home/username/giftShop`
   - **Repository Name**: `giftShop`
4. Click **Create**

### Create Deployment File

Add `.cpanel.yml` to your repository root:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/username/public_html/
    - export APIPATH=/home/username/nodeapp/
    # Copy client build to public_html
    - /bin/cp -R client/dist/* $DEPLOYPATH
    # Copy API files
    - /bin/mkdir -p $APIPATH
    - /bin/mkdir -p $APIPATH/uploads
    - /bin/cp api/server.js api/package.json $APIPATH
    - /bin/cp -R api/controllers api/models api/routes api/middlewares api/utils $APIPATH
    - cd $APIPATH && /usr/local/bin/npm install --production
```

> Replace `username` with your cPanel username (visible in cPanel top-right)

Commit and push the `.cpanel.yml`, then in cPanel → Git Version Control → **Pull or Deploy** → **Deploy HEAD Commit**

### Alternative: Manual Upload

If Git Version Control is not available, use **File Manager**:

1. Upload `client/dist/*` contents to `/public_html/`
2. Create `/home/username/nodeapp/`
3. Upload all API files there (`server.js`, `package.json`, `controllers/`, `models/`, `routes/`, `middlewares/`, `utils/`)

---

## Step 7: Setup Node.js Application

1. In cPanel → **Setup Node.js App** (under Software)
2. Click **Create Application**
3. Configure:

| Field | Value |
|-------|-------|
| Node.js version | **18.x** or **20.x** |
| Application mode | **Production** |
| Application root | `nodeapp` |
| Application URL | `yourdomain.com` |
| Application startup file | `server.js` |

4. Click **Create**

### Add Environment Variables

In the Node.js App panel, scroll to **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `PORT` | `3000` |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/giftShop?retryWrites=true&w=majority` |
| `JWT_SECRET` | `a_long_random_string_at_least_32_chars` |
| `EMAIL_USER` | `your@gmail.com` |
| `EMAIL_PASS` | `your_16_char_app_password` |
| `APP_URL` | `https://yourdomain.com` |
| `NODE_ENV` | `production` |

5. Click **Run NPM Install**
6. Click **Start App** (or Restart)

---

## Step 8: Configure .htaccess for Routing

Create/edit `/public_html/.htaccess`:

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy /api/* and /uploads/* requests to Node.js app
RewriteRule ^api/(.*)$ http://127.0.0.1:3000/api/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:3000/uploads/$1 [P,L]

# React Router — serve index.html for all non-file routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

**What this does:**
- `https://yourdomain.com/api/*` → proxied to Express on port 3000
- `https://yourdomain.com/uploads/*` → serves payment screenshots from Express
- All other routes → React's `index.html` (client-side routing)

---

## Step 9: Setup SSL Certificate

1. In cPanel → **SSL/TLS Status** or **Let's Encrypt™ SSL**
2. Click **Issue** for your domain (free certificate)
3. Enable **Force HTTPS Redirect** (or rely on the .htaccess rule above)

---

## Step 10: Link GoDaddy Domain

### Domain + Hosting both on GoDaddy (Most Common)

Usually auto-linked. Verify in:

1. cPanel → **Domains** → Your domain should be listed with `Document Root: /home/username/public_html`

### If DNS needs manual setup:

1. GoDaddy → **My Products** → **Domains** → your domain → **DNS**
2. Set:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `(hosting IP from cPanel → General Info → Shared IP)` | 600 |
| CNAME | www | `yourdomain.com` | 1 hour |

### If domain is on another registrar:

Point nameservers to GoDaddy:
```
ns1.secureserver.net
ns2.secureserver.net
```

> DNS propagation takes 15 min to 48 hours.

---

## Step 11: Verify Everything Works

| Test | URL | Expected |
|------|-----|----------|
| Homepage | `https://yourdomain.com` | React app loads with banner + products |
| API health | `https://yourdomain.com/api/` | "Welcome to the Gift Shop API !!!!!" |
| Products | `https://yourdomain.com/api/products/all` | JSON array of products |
| Images | Products show base64 images | ✅ No file hosting needed |
| Login | Register/login works | JWT issued, stored in client |
| Admin | `/admin` route | Admin panel loads for admin users |

---

## Updating the App Later

### If using GitHub + cPanel Git:

1. Make changes locally
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. In cPanel → **Git Version Control** → **Pull or Deploy** → **Update from Remote** → **Deploy HEAD Commit**
4. In cPanel → **Setup Node.js App** → Click **Restart**

### If using manual upload:

1. Build client: `cd client && npm run build`
2. Upload new `dist/*` to `public_html/` (overwrite)
3. Upload changed API files to `nodeapp/`
4. Restart Node.js app in cPanel

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| **502 Bad Gateway** | Node.js app crashed | cPanel → Node.js App → Check logs → Restart |
| **CORS errors in browser** | API origin mismatch | `server.js` has `origin: true` — should work. Check .htaccess proxy |
| **MongoDB connection refused** | Wrong URI or IP not whitelisted | Atlas → Network Access → Ensure `0.0.0.0/0` is added |
| **Images not showing** | Products use base64 in DB | Shouldn't be an issue. Check DB has data |
| **Payment screenshots 404** | `uploads/` folder missing or wrong path | Create `uploads/` in API folder, ensure .htaccess proxies `/uploads/` |
| **React routes show 404** | .htaccess missing fallback | Add the `RewriteRule ^ index.html [L]` rule |
| **"Setup Node.js App" not in cPanel** | Hosting plan too basic | Upgrade to Business/Ultimate tier or use VPS |
| **ES Module error** | Node.js version too old | Ensure Node 18+ is selected in cPanel |
| **Email not sending** | Wrong app password or 2FA not enabled | Regenerate Gmail App Password |
| **Login not working after deploy** | JWT_SECRET different from dev | Doesn't matter for new users, old tokens just expire |

---

## Important Notes About Your App

1. **Product images are stored as Base64 in MongoDB** (not on disk) — no image hosting/CDN needed
2. **Only payment screenshots use disk** (`uploads/` folder) — make sure this folder exists and is writable
3. **ES Modules** (`"type": "module"`) — requires Node.js 18+
4. **CORS is set to `origin: true`** — accepts all origins, fine for single-domain deployment
5. **No build step for API** — just `npm install` and run `server.js` directly
6. **Client uses `VITE_API_URL` + `/api`** — so `VITE_API_URL` should be the bare domain

---

## Cost Summary

| Service | Cost |
|---------|------|
| GoDaddy Web Hosting (Business) | ~₹250-500/month |
| GoDaddy Domain (.com) | ~₹700-1000/year |
| MongoDB Atlas (M0 Free) | ₹0 (512MB storage) |
| SSL Certificate | ₹0 (Let's Encrypt via cPanel) |
| Gmail (for notifications) | ₹0 |
| **Total** | **~₹300-500/month** |
