# Deployment Guide - Todo App

## 🚀 Quick Deployment (Easiest Method)

### Prerequisites
- Git installed
- GitHub account (free)
- Render account (free) - https://render.com

---

## Method 1: Render (Free, Recommended)

### Step 1: Prepare the Project

1. **Update server.js to serve the HTML**
   - Already done! The API and GUI will be on the same server

2. **Create a production start script**
   - Already configured in package.json

3. **Set up environment variables**
   - Will be configured in Render dashboard

### Step 2: Create GitHub Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Todo App"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

1. **Go to https://render.com**
2. **Sign up / Login**
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**
   - **Name**: todo-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. **Add Environment Variables** (click "Advanced"):
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-random-string-here-change-this
   DATABASE_URL=  (will be filled automatically when you add PostgreSQL)
   ```

7. **Add PostgreSQL Database**:
   - Go to "Environment" tab
   - Click "Add PostgreSQL Database"
   - Choose Free tier
   - Copy the "Internal Database URL" to DATABASE_URL

8. **Deploy!**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment

### Step 4: Update Frontend URL

Once deployed, Render gives you a URL like: `https://todo-app-xxxx.onrender.com`

**You need to update the HTML file:**
- Change `API_URL = 'http://localhost:3000/api'`
- To: `API_URL = 'https://your-app.onrender.com/api'`
- Commit and push changes

### Step 5: Share Your App!

Your app will be live at:
- **URL**: `https://your-app.onrender.com`
- **Share this link** with anyone!

---

## Method 2: Railway (Alternative, Also Free)

### Step 1: Sign up at Railway
https://railway.app

### Step 2: Create New Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js

### Step 3: Add PostgreSQL
1. Click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically sets DATABASE_URL

### Step 4: Set Environment Variables
```
NODE_ENV=production
JWT_SECRET=your-secret-key
```

### Step 5: Deploy
- Automatic! Railway deploys on every push
- Get your URL from the dashboard

---

## Method 3: Vercel (Frontend) + Render (Backend)

### Backend on Render
Same as Method 1

### Frontend on Vercel
1. Create `public` folder
2. Move `todo-app.html` to `public/index.html`
3. Update API_URL to your Render backend URL
4. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```

---

## 🔒 Important Security Notes

### Before Deploying:

1. **Change JWT_SECRET**
   ```
   JWT_SECRET=use-a-long-random-string-here-at-least-32-characters
   ```
   Generate one: https://randomkeygen.com/

2. **Update CORS in production**
   In `src/server.js`, change:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }));
   ```

3. **PostgreSQL is required**
   - SQLite doesn't work on most cloud platforms
   - Use the PostgreSQL add-on

---

## 💰 Cost Breakdown

### Free Tier Limits:

**Render**:
- ✅ Free web service (sleeps after 15 min inactivity)
- ✅ Free PostgreSQL (90 days, then $7/month)
- ⚠️ App "wakes up" in ~30 seconds on first request

**Railway**:
- ✅ $5 free credit per month
- ✅ Enough for hobby projects
- ✅ No sleep time

**Vercel**:
- ✅ Free for personal projects
- ✅ Always active

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is set correctly
- Ensure it starts with `postgresql://`

### "CORS error"
- Update CORS origin in server.js
- Match your frontend URL

### "App takes long to load"
- Free tier sleeps after inactivity
- First request takes ~30 seconds
- Upgrade to paid tier for always-on

### "JWT token errors"
- Make sure JWT_SECRET is the same across deploys
- Users need to re-login after changing it

---

## 📊 After Deployment

### Monitor Your App
- Render provides logs in the dashboard
- Check for errors in the "Logs" tab

### Database Management
- Connect with any PostgreSQL client
- Use connection string from Render/Railway

### Updates
- Push to GitHub → Auto-deploys
- Changes go live in ~2-5 minutes

---

## 🎯 Recommended Setup for Beginners

1. **Use Render** (easiest)
2. **Serve HTML from Express** (one deployment)
3. **Free PostgreSQL** (90 days free trial)
4. **Cost after 90 days**: ~$7/month for database

---

## 🚀 Quick Start Commands

```bash
# 1. Initialize git
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo and push
git remote add origin YOUR_REPO_URL
git push -u origin main

# 3. Deploy to Render (via dashboard)
# Follow Step 3 from Method 1 above

# 4. Your app is live!
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render/Railway account created
- [ ] PostgreSQL database added
- [ ] Environment variables set (JWT_SECRET, DATABASE_URL)
- [ ] CORS configured for production
- [ ] HTML file updated with production API URL
- [ ] Test registration/login
- [ ] Test creating/viewing todos
- [ ] Share link with others!

---

## 🌟 Pro Tips

1. **Custom Domain**: Both Render and Railway support custom domains (free)
2. **HTTPS**: Automatic with all platforms
3. **Monitoring**: Set up status checks on https://uptimerobot.com (free)
4. **Backups**: Enable automatic database backups in Render/Railway

---

Need help with any step? Let me know!
