# 🔧 Fix Backend URL - Step by Step Guide

## ⚠️ Current Problem

Your frontend is using the **WRONG backend URL**:
- ❌ **Current (Wrong)**: `https://ai-form-builder-backend.onrender.com`
- ✅ **Correct**: `https://ai-generated-survey-and-form-builder.onrender.com`

This is why you're getting timeout errors!

---

## 📋 Step-by-Step Fix

### Step 1: Open Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Sign in if needed
3. Find and click on your project: **`-AI-Generated-Survey-and-Form-Builder`**

### Step 2: Go to Environment Variables
1. Click on **"Settings"** (top menu)
2. Click on **"Environment Variables"** (left sidebar)

### Step 3: Check Current Value
1. Look for `VITE_API_URL` in the list
2. Check what value it has
3. If it shows `https://ai-form-builder-backend.onrender.com` or is missing, continue to Step 4

### Step 4: Update the Variable

**Option A: If `VITE_API_URL` exists with wrong value**
1. Click the **"..."** menu next to `VITE_API_URL`
2. Click **"Delete"** to remove it
3. Then click **"Add New"** button

**Option B: If `VITE_API_URL` doesn't exist**
1. Click **"Add New"** button

**Then:**
1. **Key**: Type `VITE_API_URL`
2. **Value**: Type `https://ai-generated-survey-and-form-builder.onrender.com`
3. **Environment**: 
   - ✅ Check **"Production"**
   - ✅ Check **"Preview"** (optional but recommended)
   - ⬜ **"Development"** (optional)
4. Click **"Save"**

### Step 5: Redeploy Your App
1. Go to **"Deployments"** tab (top menu)
2. Find the latest deployment
3. Click the **"..."** (three dots) menu on the right
4. Click **"Redeploy"**
5. Confirm by clicking **"Redeploy"** again
6. Wait 2-5 minutes for deployment to complete

### Step 6: Verify It's Fixed
1. Go to your app: https://ai-generated-survey-and-form-builde.vercel.app/
2. Open browser console (Press **F12** → **Console** tab)
3. You should see:
   ```
   ✅ API URL configured: https://ai-generated-survey-and-form-builder.onrender.com
   ```
4. Click **"Dashboard"** - it should load without errors!

---

## ✅ Expected Result

After fixing:
- ✅ Dashboard loads correctly
- ✅ No timeout errors
- ✅ Forms save properly
- ✅ All features work

---

## 🎯 Visual Guide

**In Vercel Environment Variables, it should look like this:**

```
Key: VITE_API_URL
Value: https://ai-generated-survey-and-form-builder.onrender.com
Environment: Production ✓
```

---

## ⚠️ Important Notes

1. **After updating the variable, you MUST redeploy** for changes to take effect
2. The old deployment still uses the old environment variable
3. New deployments will use the updated variable

---

## 🐛 Still Having Issues?

If after redeploying you still see the wrong URL:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check Vercel deployment logs to confirm the variable is set
4. Make sure you redeployed AFTER updating the variable

---

**This fix will solve all your timeout issues!** 🚀

