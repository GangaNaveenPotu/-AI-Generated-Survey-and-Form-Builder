# Deploy Frontend to Render - Complete Guide

## Backend URL (Already Deployed)
**https://ai-generated-survey-and-form-builder.onrender.com**

---

## 🚀 Deploy Frontend to Render

### Step 1: Go to Render Dashboard
1. Visit: **https://render.com**
2. Sign in (or create account if needed)
3. Click **"New +"** → **"Static Site"**

### Step 2: Connect Repository
1. Connect your GitHub account if not already connected
2. Select repository: **`-AI-Generated-Survey-and-Form-Builder`**
3. Click **"Connect"**

### Step 3: Configure Static Site
1. **Name**: `ai-form-builder-frontend` (or your choice)
2. **Branch**: `main`
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`

### Step 4: Add Environment Variable
1. Scroll down to **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://ai-generated-survey-and-form-builder.onrender.com`
4. Click **"Save"**

### Step 5: Deploy
1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build and deployment
3. Your frontend will be live at: `https://ai-form-builder-frontend.onrender.com` (or your chosen name)

---

## ✅ After Deployment

### Your Live URLs:
- **Frontend**: `https://ai-form-builder-frontend.onrender.com` (or your name)
- **Backend**: `https://ai-generated-survey-and-form-builder.onrender.com`

### Test Your App:
1. Visit your frontend URL
2. Open browser console (F12)
3. You should see: `✅ API URL configured: https://ai-generated-survey-and-form-builder.onrender.com`
4. Test creating a form
5. Test saving forms
6. Test dashboard

---

## 🔧 Configuration Summary

**Frontend (Render Static Site):**
- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL = https://ai-generated-survey-and-form-builder.onrender.com`

**Backend (Render Web Service):**
- Already deployed at: `https://ai-generated-survey-and-form-builder.onrender.com`

---

## 📝 Notes

- Render Static Sites are **free** and have no spin-down
- Both frontend and backend will be on the same platform
- Environment variables are set during deployment
- Auto-deploys on every git push to main branch

---

## 🎯 Advantages of Render for Frontend

- ✅ No spin-down (unlike backend free tier)
- ✅ Fast CDN delivery
- ✅ Free SSL certificate
- ✅ Same platform as backend
- ✅ Easy to manage

---

**Your backend is ready! Just follow the steps above to deploy the frontend.** 🚀

