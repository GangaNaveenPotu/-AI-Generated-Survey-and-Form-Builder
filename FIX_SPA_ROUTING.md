# 🔧 Fix "Page Not Found" for Shared Form Links

## Problem
When someone opens a shared form link (e.g., `https://your-site.com/form/123`), they get a "Page Not Found" error.

## Cause
This happens because Render static sites don't automatically handle React Router's client-side routing. When someone visits `/form/123` directly, the server looks for that file, which doesn't exist.

## Solution: Configure SPA Routing in Render

### Step-by-Step Fix:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in to your account

2. **Select Your Frontend Static Site**
   - Click on your frontend service (e.g., `ai-form-builder-frontend`)

3. **Navigate to Settings**
   - Click on **"Settings"** tab in the left sidebar

4. **Add Redirect/Rewrite Rule**
   - Scroll down to **"Redirects/Rewrites"** section
   - Click **"Add Redirect/Rewrite"** or **"Add Rule"**

5. **Configure the Rule:**
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action/Type**: Select **"Rewrite"** (NOT "Redirect")
   - **Status Code**: `200` (if asked)

6. **Save and Redeploy**
   - Click **"Save"** or **"Save Changes"**
   - Render will automatically redeploy your site
   - Wait 2-3 minutes for deployment to complete

7. **Test**
   - Try opening a shared form link
   - It should now work correctly!

## What This Does

The rewrite rule tells Render:
- "For any URL path (`/*`), serve the `index.html` file"
- This allows React Router to handle the routing on the client side
- Users can now access any route directly without getting 404 errors

## Alternative: If Rewrite Option Not Available

If you don't see a "Rewrite" option, use "Redirect" with status code `200`:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Status Code**: `200`

---

**After configuring this, all shared form links will work correctly!** ✅

