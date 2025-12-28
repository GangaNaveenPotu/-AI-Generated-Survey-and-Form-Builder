# AI-Generated Survey and Form Builder

A full-stack MERN application that allows users to create, manage, and analyze surveys and forms with AI-powered suggestions. Features an intuitive drag-and-drop form builder, real-time analytics, and seamless integration with Claude API for intelligent form generation.

## 🌐 Live Demo

**🎉 Application is live and ready to use!**

- **Frontend (Render)**: [https://ai-form-builder-frontend.onrender.com](https://ai-form-builder-frontend.onrender.com)
- **Backend API (Render)**: [https://ai-generated-survey-and-form-builder.onrender.com](https://ai-generated-survey-and-form-builder.onrender.com)

### Try It Now!

1. Visit the [live frontend](https://ai-form-builder-frontend.onrender.com)
2. Sign up for a new account or sign in
3. You'll be redirected to the form builder page
4. Create a form manually or using AI generation
5. Save your form (you'll be redirected to dashboard)
6. Share your form link with others
7. View analytics and charts for responses

---

## ✨ Features

- 🔐 **User Authentication**: Secure sign up and sign in with JWT-based authentication
- 🚀 **AI-Powered Form Generation**: Generate form fields using natural language descriptions via Claude API or Gemini API
- 🖥️ **Drag-and-Drop Interface**: Intuitive form builder with drag-and-drop field reordering
- 📊 **Interactive Analytics Dashboard**: Visualize form responses with pie charts, bar charts, and statistics
- 🔄 **Real-time Updates**: See changes as you build your form
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 📤 **CSV Export**: Export response data for further analysis
- ✅ **Form Validation**: Built-in validation for required fields
- 🔗 **Form Sharing**: Share forms via direct links with social media integration
- 🎨 **Modern UI**: Beautiful, intuitive interface built with Tailwind CSS
- 🛡️ **Protected Routes**: Secure access to user-specific forms and data

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Claude API** - AI form generation (Anthropic)
- **Gemini API** - Alternative AI form generation (Google)

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DnD Kit** - Drag and drop functionality
- **Chart.js** - Data visualization
- **Axios** - HTTP client

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)
- Claude API key (optional - for AI features)
- Gemini API key (optional - alternative to Claude API)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/GangaNaveenPotu/-AI-Generated-Survey-and-Form-Builder.git
cd MERN_ROLE
```

### 2. Set Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-generated-form?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_change_in_production
   CLAUDE_API_KEY=your_claude_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```
   
   **⚠️ Security Note:** Never commit your `.env` file or expose real credentials. Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your actual MongoDB Atlas credentials. Use a strong, random string for `JWT_SECRET` in production.
   
   **📝 Note:** `GEMINI_API_KEY` is optional. Claude API is the default. You can use Gemini API as an alternative by selecting it in the form builder.

4. Start the backend server:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:5000`

### 3. Set Up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional for local development):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

---

## 📖 Usage Guide

### User Flow

1. **Sign Up / Sign In**: Create an account or sign in to access the application
2. **Form Builder**: After signing in, you'll be redirected to the form building page
3. **Create Form**: Build your form manually or use AI generation
4. **Save Form**: After saving, you'll be redirected to your dashboard
5. **Manage Forms**: View, edit, delete, or share forms from the dashboard
6. **View Analytics**: Analyze form responses with visual charts and statistics

### Getting Started

1. **Sign Up**: Create a new account with your name, email, and password
2. **Sign In**: Use your credentials to access the application
3. You'll be automatically redirected to the form builder page

### Creating a New Form

1. After signing in, you'll land on the form builder page
2. Enter a title and description for your form
3. Add form fields:
   - **Manually**: Click field types from the sidebar (Text, Textarea, Number, Radio, Checkbox, Select)
   - **With AI**: Click "AI Magic" tab, describe your form, and click "Generate Form"
4. Customize fields:
   - Edit labels and placeholders
   - Add options for radio/checkbox/select fields
   - Set fields as required/optional
   - Drag and drop to reorder fields
5. Click **"Publish Form"** when done (you'll be redirected to dashboard)

### Generating Forms with AI

1. In the form builder, click the **"AI Magic"** tab
2. Enter a description of the form you want to create
   - Example: "Customer feedback form for an e-commerce website with 5 questions"
3. Click **"Generate Form"** to see AI-suggested form fields
4. Review and customize the generated fields as needed
5. Add more fields manually if needed

### Submitting Responses

1. From the dashboard, click **"Preview"** on any form
2. Fill out the form fields
3. Click **"Submit Response"**
4. See confirmation message

### Analyzing Responses

1. From the dashboard, click **"View Analytics"** for any form
2. View summary statistics:
   - Total responses
   - Completion rate
   - Average time (if tracked)
3. Explore per-question analytics:
   - Response distribution charts
   - Response counts
   - Percentage breakdowns
4. Export data as CSV for further analysis

### Sharing Forms

1. From the dashboard, click the **Share** icon on any form
2. Copy the form link or share via:
   - Copy link to clipboard
   - WhatsApp
   - Facebook
   - Twitter
   - LinkedIn
   - Email
3. Anyone with the link can view and submit responses

### User Authentication

- **Sign Up**: Create a new account with name, email, and password
- **Sign In**: Access your account with email and password
- **Protected Routes**: Forms, dashboard, and analytics require authentication
- **Public Forms**: Form viewing and submission is public (no login required)
- **Session Management**: Tokens persist for 7 days, auto-logout on expiry

---

## 📁 Project Structure

```
MERN_ROLE/
├── backend/                    # Backend server
│   ├── models/                # MongoDB models
│   │   ├── Form.js           # Form schema
│   │   ├── Response.js       # Response schema
│   │   └── User.js           # User schema (authentication)
│   ├── routes/                # API routes
│   │   ├── api.js           # Form and AI endpoints (protected)
│   │   └── auth.js          # Authentication endpoints
│   ├── server.js             # Express server setup
│   ├── package.json         # Backend dependencies
│   └── render.yaml          # Render deployment config
│
├── frontend/                  # Frontend React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx      # User dashboard
│   │   │   ├── FormBuilder.jsx    # Form creation/editing
│   │   │   ├── FormRenderer.jsx   # Public form view
│   │   │   ├── Analytics.jsx      # Form analytics
│   │   │   ├── SignIn.jsx         # Sign in page
│   │   │   ├── SignUp.jsx         # Sign up page
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   └── ShareModal.jsx     # Form sharing modal
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── config/          # Configuration files
│   │   │   └── api.js      # API endpoints configuration
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Authentication (Public)

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Sign in existing user
- `GET /api/v1/auth/me` - Get current user info (requires authentication)

### Forms

- `GET /api/v1/forms` - Get all forms for authenticated user (🔒 Protected)
- `GET /api/v1/forms/:id` - Get a specific form (Public - for form viewing/submission)
- `POST /api/v1/forms` - Create a new form (🔒 Protected)
- `PUT /api/v1/forms/:id` - Update a form (🔒 Protected)
- `DELETE /api/v1/forms/:id` - Delete a form (🔒 Protected)

### Responses

- `POST /api/v1/forms/:id/response` - Submit a new response (Public)
- `GET /api/v1/forms/:id/analytics` - Get analytics for a form (🔒 Protected)

### AI Generation

- `POST /api/v1/ai/generate` - Generate form fields using Claude API (🔒 Protected)
- `POST /api/v1/ai/generate-gemini` - Generate form fields using Gemini API (🔒 Protected)
- `POST /api/v1/ai/generate-form` - Generate complete form using AI (🔒 Protected)

**Legend:** 🔒 Protected = Requires JWT authentication token in header

---

## 🌍 Deployment

### Current Deployment

- **Frontend**: Deployed on [Render](https://render.com) as Static Site
- **Backend**: Deployed on [Render](https://render.com) as Web Service
- **Database**: MongoDB Atlas (free tier)

### Deployment URLs

- Frontend: https://ai-form-builder-frontend.onrender.com
- Backend: https://ai-generated-survey-and-form-builder.onrender.com

### Deploying to Render

#### Backend Deployment (Web Service)

1. Go to [Render Dashboard](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-generated-survey-and-form-builder`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-generated-form
   JWT_SECRET=your_strong_random_secret_key_here
   CLAUDE_API_KEY=your_claude_api_key
   GEMINI_API_KEY=your_gemini_api_key (optional)
   NODE_ENV=production
   PORT=10000
   ```
6. Click **"Create Web Service"**

#### Frontend Deployment (Static Site)

1. Go to [Render Dashboard](https://render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-form-builder-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://ai-generated-survey-and-form-builder.onrender.com
   ```
6. **⚠️ IMPORTANT - Configure SPA Routing:**
   - After creating the site, go to **Settings** → **Redirects/Rewrites**
   - Add a new rewrite rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite` (not Redirect)
   - This ensures shared form links work correctly
7. Click **"Create Static Site"**

**⚠️ Security Warning:** Use environment variables in your hosting platform. Never commit real credentials to the repository.

---

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-generated-form?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_in_production
CLAUDE_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important:** 
- Replace all placeholder values with your actual credentials
- `JWT_SECRET` should be a strong, random string (use a generator in production)
- `GEMINI_API_KEY` is optional - app works with just Claude API
- Never commit this file to version control

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

## 📝 Field Types Supported

- **Text** - Short text input
- **Textarea** - Long text input
- **Number** - Numeric input
- **Radio** - Single choice selection
- **Checkbox** - Multiple choice selection
- **Select** - Dropdown selection

---

## 🎯 Key Features Explained

### User Flow
1. **Sign In/Sign Up** → Redirects to Form Builder (`/create`)
2. **Create/Edit Form** → Build forms with manual or AI generation
3. **Save Form** → Redirects to Dashboard (`/`)
4. **Manage Forms** → View, edit, delete, share, or analyze forms from dashboard

### Drag-and-Drop Form Builder
- Reorder fields by dragging the grip handle
- Visual feedback during dragging
- Keyboard navigation support
- Real-time preview of form structure

### AI Form Generation
- Support for both Claude API and Gemini API
- Toggle between AI providers in the form builder
- Describe your form in natural language
- AI suggests appropriate field types and questions
- Customize generated fields as needed

### Analytics Dashboard
- Visual charts (Pie and Bar charts using Chart.js)
- Response statistics and summaries
- Per-question analytics with expandable sections
- CSV export functionality
- Completion rate calculations

### Form Sharing
- Generate shareable links for forms
- Share via social media (WhatsApp, Facebook, Twitter, LinkedIn)
- Copy link to clipboard
- Email sharing option
- Public form viewing (no authentication required for submissions)

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for all IPs)
- Ensure database user credentials are correct

**Authentication Errors:**
- Verify JWT_SECRET is set in environment variables
- Check if token is being sent in Authorization header
- Ensure token hasn't expired (default: 7 days)
- Clear localStorage and sign in again if token is invalid

**Claude/Gemini API Errors:**
- Verify API key is correct in environment variables
- Check if you have sufficient credits
- API keys are optional - app works without them (AI features disabled)
- For Gemini API errors, ensure GEMINI_API_KEY is set if using Gemini provider

### Frontend Issues

**Cannot Connect to Backend:**
- Verify `VITE_API_URL` environment variable
- Check backend is running
- Verify CORS settings in backend

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (v16+ required)

**"Page Not Found" When Opening Shared Form Links:**
- This is a common SPA routing issue on Render
- **Solution**: Configure redirects/rewrites in Render dashboard:
  1. Go to your static site in Render dashboard
  2. Navigate to **Settings** → **Redirects/Rewrites**
  3. Add rewrite rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite` (not Redirect)
  4. Save and redeploy
- This ensures all routes are handled by React Router

---

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---



---

##  Acknowledgments

- [Anthropic](https://www.anthropic.com/) for the Claude API
- [Google](https://ai.google.dev/) for the Gemini API
- [MongoDB](https://www.mongodb.com/) for the database
- [React](https://reactjs.org/) and [Express](https://expressjs.com/) for the web frameworks
- [Chart.js](https://www.chartjs.org/) for data visualization
- [DnD Kit](https://dndkit.com/) for drag-and-drop functionality
- [Render](https://render.com/) for hosting

---

##  Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/GangaNaveenPotu/-AI-Generated-Survey-and-Form-Builder).
ganganaveenpotu@gmail.com 
---

**Made with using the MERN stack**
