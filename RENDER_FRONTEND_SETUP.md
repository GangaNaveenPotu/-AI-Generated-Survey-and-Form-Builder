# 🚀 Deploy Frontend to Render - Step by Step

## Backend URL (Already Deployed)
**✅ https://ai-generated-survey-and-form-builder.onrender.com**

---

## 📋 Deploy Frontend to Render (5 minutes)

### Step 1: Go to Render Dashboard
1. Visit: **https://render.com**
2. Sign in with your account
3. Click **"New +"** button (top right)
4. Select **"Static Site"**

### Step 2: Connect Your Repository
1. If not connected, connect your GitHub account
2. Select repository: **`-AI-Generated-Survey-and-Form-Builder`**
3. Click **"Connect"**

### Step 3: Configure the Static Site

Fill in these settings:

- **Name**: `ai-form-builder-frontend` (or any name you prefer)
- **Branch**: `main`
- **Root Directory**: `frontend` ⚠️ **IMPORTANT: Set this to `frontend`**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Step 4: Add Environment Variable ⚠️ CRITICAL

1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://ai-generated-survey-and-form-builder.onrender.com`
   - **⚠️ Make sure there's NO trailing slash!**
4. Click **"Save"**

### Step 5: Deploy
1. Click **"Create Static Site"** button
2. Wait 3-5 minutes for build and deployment
3. Your frontend will be live!

---

## ✅ After Deployment

### Your Live URLs:
- **Frontend**: `https://ai-form-builder-frontend.onrender.com` (or your chosen name)
- **Backend**: `https://ai-generated-survey-and-form-builder.onrender.com`

### Verify It Works:
1. Visit your frontend URL
2. Open browser console (F12)
3. You should see: `✅ API URL configured: https://ai-generated-survey-and-form-builder.onrender.com`
4. Test the Dashboard - should load without errors
5. Create a form - should save successfully
6. Submit responses - should work

---

## 🔧 Configuration Summary

**Frontend (Render Static Site):**
```
Name: ai-form-builder-frontend
Branch: main
Root Directory: frontend
Build Command: npm run build
Publish Directory: dist
Environment Variable:
  VITE_API_URL = https://ai-generated-survey-and-form-builder.onrender.com
```

**Backend (Render Web Service):**
```
Already deployed at: https://ai-generated-survey-and-form-builder.onrender.com
```

---

## 🎯 Advantages of Render for Frontend

- ✅ **No spin-down** (unlike backend free tier)
- ✅ **Fast CDN** delivery worldwide
- ✅ **Free SSL** certificate
- ✅ **Same platform** as backend (easier management)
- ✅ **Auto-deploy** on git push
- ✅ **Free tier** available

---

## 📝 Important Notes

1. **Root Directory**: Must be set to `frontend` (not root of repo)
2. **Environment Variable**: Must be set BEFORE first deployment
3. **Build Time**: First build takes 3-5 minutes
4. **Auto-Deploy**: Future pushes to main branch auto-deploy

---

## 🐛 Troubleshooting

### Build Fails?
- Check that Root Directory is set to `frontend`
- Verify Build Command is `npm run build`
- Check build logs in Render dashboard

### Still Getting 404 Errors?
- Verify `VITE_API_URL` environment variable is set correctly
- Make sure there's NO trailing slash in the URL
- Check browser console for the actual API URL being used

### CORS Errors?
- Backend CORS is already configured to allow all origins
- Should work automatically

---

## ✅ Quick Checklist

- [ ] Render account created/logged in
- [ ] Repository connected
- [ ] Static Site created with correct settings
- [ ] Root Directory set to `frontend`
- [ ] Build Command: `npm run build`
- [ ] Publish Directory: `dist`
- [ ] Environment Variable `VITE_API_URL` added
- [ ] Value: `https://ai-generated-survey-and-form-builder.onrender.com` (no trailing slash)
- [ ] Site deployed successfully
- [ ] Tested and working!

---

**Your backend is ready! Follow these steps to deploy the frontend on Render.** 🚀

