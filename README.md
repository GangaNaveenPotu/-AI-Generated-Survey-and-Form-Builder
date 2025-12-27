# AI-Generated Survey and Form Builder

A full-stack MERN application that allows users to create, manage, and analyze surveys and forms with AI-powered suggestions. Features an intuitive drag-and-drop form builder, real-time analytics, and seamless integration with Claude API for intelligent form generation.

## 🌐 Live Demo

**🎉 Application is live and ready to use!**

- **Frontend (Vercel)**: [https://ai-generated-survey-and-form-builde.vercel.app/](https://ai-generated-survey-and-form-builde.vercel.app/)
- **Backend API (Render)**: [https://ai-generated-survey-and-form-builder.onrender.com](https://ai-generated-survey-and-form-builder.onrender.com)

### Try It Now!

1. Visit the [live frontend](https://ai-generated-survey-and-form-builde.vercel.app/)
2. Create a new form
3. Add fields using drag-and-drop
4. Submit test responses
5. View analytics and charts

---

## ✨ Features

- 🚀 **AI-Powered Form Generation**: Generate form fields using natural language descriptions via Claude API
- 🖥️ **Drag-and-Drop Interface**: Intuitive form builder with drag-and-drop field reordering
- 📊 **Interactive Analytics Dashboard**: Visualize form responses with pie charts, bar charts, and statistics
- 🔄 **Real-time Updates**: See changes as you build your form
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 📤 **CSV Export**: Export response data for further analysis
- ✅ **Form Validation**: Built-in validation for required fields
- 🎨 **Modern UI**: Beautiful, intuitive interface built with Tailwind CSS

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM for MongoDB
- **Claude API** - AI form generation (Anthropic)

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
   CLAUDE_API_KEY=your_claude_api_key_here
   NODE_ENV=development
   ```
   
   **⚠️ Security Note:** Never commit your `.env` file or expose real credentials. Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your actual MongoDB Atlas credentials.

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

### Creating a New Form

1. Click on **"Create New Form"** in the dashboard
2. Enter a title and description for your form
3. Add form fields:
   - **Manually**: Click field types from the sidebar (Text, Textarea, Number, Radio, Checkbox, Select)
   - **With AI**: Click "AI Magic" tab, describe your form, and click "Generate Form"
4. Customize fields:
   - Edit labels and placeholders
   - Add options for radio/checkbox/select fields
   - Set fields as required/optional
   - Drag and drop to reorder fields
5. Click **"Publish Form"** when done

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

---

## 📁 Project Structure

```
MERN_ROLE/
├── backend/                    # Backend server
│   ├── models/                # MongoDB models
│   │   ├── Form.js           # Form schema
│   │   └── Response.js       # Response schema
│   ├── routes/                # API routes
│   │   └── api.js           # All API endpoints
│   ├── server.js             # Express server setup
│   ├── package.json         # Backend dependencies
│   └── render.yaml          # Render deployment config
│
├── frontend/                  # Frontend React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FormBuilder.jsx
│   │   │   ├── FormRenderer.jsx
│   │   │   └── Analytics.jsx
│   │   ├── config/          # Configuration files
│   │   │   └── api.js      # API endpoints configuration
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   ├── vercel.json         # Vercel deployment config
│   └── vite.config.js      # Vite configuration
│
├── DEMO.md                  # Demo script
├── EXAMPLE.md               # Example usage guide
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Forms

- `GET /api/v1/forms` - Get all forms
- `GET /api/v1/forms/:id` - Get a specific form
- `POST /api/v1/forms` - Create a new form
- `PUT /api/v1/forms/:id` - Update a form
- `DELETE /api/v1/forms/:id` - Delete a form

### Responses

- `POST /api/v1/forms/:id/response` - Submit a new response
- `GET /api/v1/forms/:id/analytics` - Get analytics for a form (includes all responses)

### AI Generation

- `POST /api/v1/ai/generate` - Generate form fields using AI (simple prompt)
- `POST /api/v1/ai/generate-form` - Generate complete form using AI (topic, description, numQuestions)

---

## 🌍 Deployment

### Current Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com)
- **Backend**: Deployed on [Render](https://render.com)
- **Database**: MongoDB Atlas (free tier)

### Deployment URLs

- Frontend: https://ai-generated-survey-and-form-builde.vercel.app/
- Backend: https://ai-generated-survey-and-form-builder.onrender.com

### Environment Variables for Deployment

**Frontend (Vercel):**
```
VITE_API_URL=https://ai-generated-survey-and-form-builder.onrender.com
```

**Backend (Render):**
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-generated-form
CLAUDE_API_KEY=your_claude_api_key
NODE_ENV=production
PORT=10000
```

**⚠️ Security Warning:** Use environment variables in your hosting platform. Never commit real credentials to the repository.

---

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-generated-form?retryWrites=true&w=majority
CLAUDE_API_KEY=your_claude_api_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important:** Replace all placeholder values with your actual credentials. Never commit this file to version control.

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

### Drag-and-Drop Form Builder
- Reorder fields by dragging the grip handle
- Visual feedback during dragging
- Keyboard navigation support

### AI Form Generation
- Describe your form in natural language
- AI suggests appropriate field types and questions
- Customize generated fields as needed

### Analytics Dashboard
- Visual charts (Pie and Bar charts)
- Response statistics and summaries
- Per-question analytics
- CSV export functionality

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for all IPs)
- Ensure database user credentials are correct

**Claude API Errors:**
- Verify API key is correct
- Check if you have sufficient credits
- API key is optional - app works without it (AI features disabled)

### Frontend Issues

**Cannot Connect to Backend:**
- Verify `VITE_API_URL` environment variable
- Check backend is running
- Verify CORS settings in backend

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (v16+ required)

---

## 📚 Additional Resources

- [DEMO.md](./DEMO.md) - Demo script for showcasing the application
- [EXAMPLE.md](./EXAMPLE.md) - Example usage guide

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for the Claude API
- [MongoDB](https://www.mongodb.com/) for the database
- [React](https://reactjs.org/) and [Express](https://expressjs.com/) for the web frameworks
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Vercel](https://vercel.com/) and [Render](https://render.com/) for hosting

---

## 📞 Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/GangaNaveenPotu/-AI-Generated-Survey-and-Form-Builder).

---

**Made with ❤️ using the MERN stack**
