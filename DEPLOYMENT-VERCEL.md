# GiftShop — Vercel Deployment Guide (Hobby Plan + Custom Domain)

Deploy the full MERN app on Vercel's free Hobby tier with a custom domain.

---

## Deployment Strategy

| Component | Where | How |
|-----------|-------|-----|
| **Client** (React) | Vercel | Static build from `client/dist/` |
| **API** (Express) | Vercel Serverless Functions | Express wrapped as serverless function |
| **Database** | MongoDB Atlas | Free M0 cluster |
| **File Uploads** | ⚠️ Won't persist on Vercel | Convert payment screenshots to base64 in DB |

### ⚠️ Important Vercel Limitation

Vercel has **no persistent file system**. Your `uploads/` folder for payment screenshots will be wiped on each deploy. Two options:

1. **Store screenshots as base64 in MongoDB** (like you already do for product images) — **Recommended**
2. Use external storage (Cloudinary, AWS S3) — more complex

This guide includes the code change to fix this.

---

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free with GitHub)
- [GitHub account](https://github.com) with your code pushed
- [MongoDB Atlas](https://cloud.mongodb.com) free cluster
- Gmail App Password for email notifications
- Custom domain (from GoDaddy or any registrar)

---

## Step 1: Setup MongoDB Atlas

(Same as GoDaddy guide)

1. [cloud.mongodb.com](https://cloud.mongodb.com) → Create free M0 cluster
2. **Database Access** → Create user with password
3. **Network Access** → Add `0.0.0.0/0`
4. **Connect** → Copy connection string:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/giftShop?retryWrites=true&w=majority
   ```

---

## Step 2: Restructure Project for Vercel

Vercel needs a specific structure. Create these files in your project root:

### 2a. Create `api/index.js` (Serverless Entry Point)

Create a new file `api/index.js` that wraps your Express app for Vercel:

```javascript
import app from "../server.js";
export default app;
```

Wait — your Express app is in `api/server.js`. Vercel expects the `api/` folder for serverless functions. We need to restructure slightly.

### Recommended Project Structure for Vercel:

```
giftShop-master/
├── api/
│   └── index.js          ← Vercel serverless entry (NEW)
├── server/               ← Rename your current api/ to server/
│   ├── server.js
│   ├── package.json
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── utils/
├── client/
│   ├── dist/             ← Built React app
│   └── ...
├── vercel.json           ← Routing config (NEW)
└── package.json          ← Root package.json (NEW)
```

**OR** (simpler — keep current structure, just add vercel config):

---

## Step 2 (Simplified): Keep Current Structure

No need to rename folders. Just add configuration files.

### Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    },
    {
      "src": "api/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/server.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "api/server.js"
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|svg|jfif|webp|woff|woff2|ttf))",
      "dest": "client/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/index.html"
    }
  ]
}
```

### Create root `package.json`:

```json
{
  "name": "giftshop",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "cd client && npm install && npm run build",
    "install-api": "cd api && npm install"
  }
}
```

### Modify `api/server.js` for Vercel Compatibility

Add an export at the bottom so Vercel can use it as a serverless function:

```javascript
// ... existing code stays the same ...

const port = process.env.PORT || 1000;

// Only start server locally (Vercel handles this in production)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
} else {
  // Connect to MongoDB for serverless (no app.listen needed)
  mongoose.connect(process.env.MONGO_URI).catch(console.error);
}

// Export for Vercel serverless
export default app;
```

---

## Step 3: Fix Payment Screenshot Storage (Required for Vercel)

Since Vercel has no persistent disk, convert payment screenshots to base64 (like product images).

### In `api/controllers/product.js`, change the disk upload usage:

Find where payment screenshots are saved and change from disk storage to memory + base64.

### In your order controller (where `uploadDisk` is used):

Replace disk storage with memory storage and save as base64 in the Order model. For example:

```javascript
// Instead of saving file to uploads/ folder:
// const screenshot = req.file.filename;

// Save as base64:
const screenshot = req.file
  ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
  : null;
```

And in the Order model, the `paymentScreenshot` field will store the base64 string directly.

> **If you prefer not to change this**, payment screenshots simply won't persist between deploys. The app will still work — just old screenshot URLs will break.

---

## Step 4: Build Client

```bash
cd client

# Create .env.production (Vercel will serve both from same domain)
echo VITE_API_URL=https://yourdomain.com > .env.production

# Build
npm install
npm run build
```

---

## Step 5: Push to GitHub

Make sure all changes are committed:

```bash
cd c:\Users\QT924NN\Downloads\giftShop\giftShop-master

git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

---

## Step 6: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Connect your GitHub account → Select your `giftShop` repo
4. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | **Other** |
| Root Directory | `./` (leave default) |
| Build Command | `cd client && npm install && npm run build` |
| Output Directory | `client/dist` |
| Install Command | `cd api && npm install` |

5. Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/giftShop?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_long_random_secret` |
| `EMAIL_USER` | `your@gmail.com` |
| `EMAIL_PASS` | `your_gmail_app_password` |
| `APP_URL` | `https://yourdomain.com` |
| `NODE_ENV` | `production` |
| `VERCEL` | `1` |

6. Click **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
cd c:\Users\QT924NN\Downloads\giftShop\giftShop-master
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? giftshop
# - Directory? ./
# - Override settings? Yes
#   - Build Command: cd client && npm install && npm run build
#   - Output Directory: client/dist

# Deploy to production
vercel --prod
```

---

## Step 7: Connect Custom Domain

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Domains**
2. Enter your domain: `yourdomain.com`
3. Click **Add**
4. Vercel will show DNS records to configure

### In GoDaddy DNS Settings:

1. Go to GoDaddy → **My Products** → **Domains** → your domain → **DNS**
2. **Delete** existing A record for `@` (if any)
3. Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 600 |
| CNAME | www | `cname.vercel-dns.com` | 1 hour |

> Vercel's IP: `76.76.21.21` — this is their global anycast IP.

4. Wait 5-30 minutes for DNS propagation
5. Back in Vercel → the domain should show ✅ **Valid Configuration**
6. Vercel automatically provisions **free SSL** (no setup needed)

### Alternative: Use Vercel Nameservers

Instead of individual DNS records, you can point GoDaddy nameservers to Vercel:

1. In Vercel → Domains → Click your domain → **Nameservers** tab
2. Copy the nameservers (e.g., `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
3. In GoDaddy → Domains → DNS → **Nameservers** → Change → Enter custom:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

---

## Step 8: Update Environment Variable

After domain is connected, update `APP_URL`:

1. Vercel → Project → **Settings** → **Environment Variables**
2. Change `APP_URL` to `https://yourdomain.com`
3. Redeploy: **Deployments** → latest → **Redeploy**

---

## Step 9: Verify Deployment

| Test | URL | Expected |
|------|-----|----------|
| Homepage | `https://yourdomain.com` | React app loads |
| API | `https://yourdomain.com/api/` | "Welcome to the Gift Shop API !!!!!" |
| Products | `https://yourdomain.com/api/products/all` | JSON response |
| Auth | Login/Register | Works, JWT issued |
| Categories | Click categories | Products filter |
| Admin | `/admin` | Admin panel (if admin user) |

---

## Auto-Deploy on Git Push

Once connected, Vercel automatically deploys on every `git push` to `main`:

```bash
# Make changes locally
git add .
git commit -m "Update something"
git push origin main
# → Vercel auto-deploys in ~30 seconds
```

Each push also creates a **Preview Deployment** on branches/PRs.

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| **500 on API routes** | MongoDB not connected | Check `MONGO_URI` env var in Vercel settings |
| **CORS errors** | Server has `origin: true` | Should work. Check `vercel.json` routes |
| **Function timeout (10s)** | Slow DB query or cold start | MongoDB Atlas in same region as Vercel (us-east-1) |
| **404 on page refresh** | React Router not caught | Check `vercel.json` catch-all route |
| **Images not loading** | Base64 images from DB | Should work. Check products have `images` array |
| **File upload fails** | Vercel payload limit (4.5MB) | Compress images before upload or increase in vercel.json |
| **"module not found"** | Dependencies not installed | Ensure `api/package.json` has all deps |
| **Domain not working** | DNS not propagated | Wait up to 48h, or try `nslookup yourdomain.com` |
| **Domain shows "Invalid"** | Wrong DNS records | Verify A record → `76.76.21.21`, CNAME www → `cname.vercel-dns.com` |

### Increase Payload Size (if needed):

In `vercel.json`, add to the API route:

```json
{
  "src": "/api/(.*)",
  "dest": "api/server.js",
  "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
  "headers": { "Access-Control-Max-Age": "86400" }
}
```

For larger file uploads, add to `vercel.json`:

```json
{
  "functions": {
    "api/server.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

---

## Vercel Hobby Plan Limits

| Limit | Value |
|-------|-------|
| Deployments | Unlimited |
| Bandwidth | 100 GB/month |
| Serverless Function Duration | 10 seconds (max 60 on Pro) |
| Serverless Payload Size | 4.5 MB |
| Build Time | 45 minutes |
| Custom Domains | Unlimited |
| SSL | Free (automatic) |
| Team Members | 1 (personal) |

---

## Complete `vercel.json` (Final Version)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/server.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "api/server.js"
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|jfif|svg|webp|woff|woff2|ttf|gif))",
      "dest": "client/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/index.html"
    }
  ],
  "functions": {
    "api/server.js": {
      "maxDuration": 30,
      "memory": 1024,
      "includeFiles": "api/**"
    }
  }
}
```

---

## Cost: FREE

| Service | Cost |
|---------|------|
| Vercel Hobby | ₹0 |
| MongoDB Atlas M0 | ₹0 (512MB) |
| SSL Certificate | ₹0 (auto by Vercel) |
| GitHub | ₹0 |
| Gmail | ₹0 |
| Custom Domain (.com) | ~₹700-1000/year (GoDaddy) |
| **Total** | **₹0/month** (only domain renewal yearly) |
