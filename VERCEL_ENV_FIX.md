# ⚠️ CRITICAL: Fix Vercel Environment Variable

## Problem

Your frontend is trying to connect to the **WRONG backend URL**:
- ❌ Currently using: `https://ai-form-builder-backend.onrender.com`
- ✅ Should be using: `https://ai-generated-survey-and-form-builder.onrender.com`

This is causing timeout errors because the wrong URL doesn't exist or isn't responding.

## Solution: Update Vercel Environment Variable

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click on your project: `-AI-Generated-Survey-and-Form-Builder`

### Step 2: Update Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Find `VITE_API_URL` in the list
3. Click **Edit** or **Delete and Re-add**
4. Set the value to:
   ```
   https://ai-generated-survey-and-form-builder.onrender.com
   ```
5. Make sure it's set for:
   - ✅ **Production**
   - ✅ **Preview** (optional)
   - ✅ **Development** (optional)
6. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-5 minutes for deployment to complete

## Verify It's Fixed

After redeployment:

1. Open browser console (F12)
2. Check the console logs - you should see:
   ```
   Fetching forms from: https://ai-generated-survey-and-form-builder.onrender.com/api/v1/forms
   ```
3. The Dashboard should load properly
4. Form saving should work

## Current Backend URLs

- ✅ **Correct Backend**: `https://ai-generated-survey-and-form-builder.onrender.com`
- ❌ **Wrong Backend**: `https://ai-form-builder-backend.onrender.com` (doesn't exist)

## Why This Happened

The environment variable `VITE_API_URL` in Vercel is either:
- Not set (defaulting to localhost)
- Set to the wrong URL
- Set to an old/cached value

## After Fixing

Once you update the environment variable and redeploy:
- ✅ Dashboard will load correctly
- ✅ Forms will save properly
- ✅ All API calls will work
- ✅ No more timeout errors

---

**This is the root cause of your timeout issues!** Fix the environment variable and everything will work.

