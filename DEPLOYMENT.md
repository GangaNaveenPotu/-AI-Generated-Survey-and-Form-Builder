# Deployment Guide

This guide will help you deploy your AI-Generated Survey and Form Builder to free hosting platforms.

## Deployment Architecture

- **Frontend**: Vercel (or Netlify)
- **Backend**: Render (or Railway)
- **Database**: MongoDB Atlas (Free Tier)

## Prerequisites

1. GitHub account (already have)
2. MongoDB Atlas account (free)
3. Vercel account (free)
4. Render account (free)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (choose FREE tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `formbuilder` (or your choice)
   - Password: Generate a secure password
5. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get your connection string:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://formbuilder:yourpassword@cluster0.xxxxx.mongodb.net/ai-form-builder?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `-AI-Generated-Survey-and-Form-Builder`
5. Configure the service:
   - **Name**: `ai-form-builder-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `PORT`: `10000` (Render provides this automatically, but you can set it)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CLAUDE_API_KEY`: Your Claude API key (if you have credits)
   - `NODE_ENV`: `production`
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL (e.g., `https://ai-form-builder-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://ai-form-builder-backend.onrender.com`)
6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Your app will be live at: `https://your-project.vercel.app`

---

## Alternative: Deploy Frontend to Netlify

1. Go to [Netlify](https://www.netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL
6. Click "Deploy site"
7. Your app will be live at: `https://your-project.netlify.app`

---

## Step 4: Update CORS Settings

After deploying, update your backend CORS to allow your frontend domain:

In `backend/server.js`, update the CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project.vercel.app',
    'https://your-project.netlify.app'
  ],
  credentials: true
}));
```

Or for production, you can allow all origins (less secure but easier):

```javascript
app.use(cors({
  origin: true,
  credentials: true
}));
```

---

## Environment Variables Summary

### Backend (Render)
```
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-form-builder
CLAUDE_API_KEY=your_claude_api_key
NODE_ENV=production
```

### Frontend (Vercel/Netlify)
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Post-Deployment Checklist

- [ ] Backend is accessible (test: `https://your-backend.onrender.com`)
- [ ] Frontend can connect to backend
- [ ] MongoDB connection is working
- [ ] Forms can be created
- [ ] Forms can be submitted
- [ ] Analytics dashboard works
- [ ] CORS is properly configured

---

## Troubleshooting

### Backend Issues
- **Build fails**: Check that all dependencies are in `package.json`
- **Database connection fails**: Verify MongoDB Atlas IP whitelist and connection string
- **CORS errors**: Update CORS settings in `server.js`

### Frontend Issues
- **API calls fail**: Verify `VITE_API_URL` environment variable
- **Build fails**: Check that all dependencies are installed
- **404 errors**: Verify routing is configured correctly

### Common Errors
- **"Cannot connect to database"**: Check MongoDB Atlas connection string and IP whitelist
- **"CORS policy blocked"**: Update backend CORS settings
- **"API URL not found"**: Check environment variables in hosting platform

---

## Free Tier Limitations

### Render
- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

### Vercel
- Unlimited deployments
- 100GB bandwidth/month
- No spin-down

### MongoDB Atlas
- 512MB storage
- Shared cluster
- Perfect for development and small projects

---

## Need Help?

If you encounter issues:
1. Check the deployment logs in your hosting platform
2. Verify all environment variables are set correctly
3. Test the backend API directly using Postman or curl
4. Check browser console for frontend errors

