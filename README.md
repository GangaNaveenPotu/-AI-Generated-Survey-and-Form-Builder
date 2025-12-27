# AI-Generated Survey and Form Builder

A full-stack application that allows users to create, manage, and analyze surveys and forms with the help of AI-powered suggestions. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and integrated with the Claude API for AI-generated form fields.

## Features

- 🚀 **AI-Powered Form Generation**: Generate form fields using natural language descriptions
- 🖥️ **Drag-and-Drop Interface**: Intuitive form builder with drag-and-drop functionality
- 📊 **Interactive Analytics**: Visualize form responses with charts and statistics
- 🔄 **Real-time Updates**: See changes as you build your form
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 📤 **Export Data**: Export response data as CSV for further analysis

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Claude API key (from [Anthropic](https://console.anthropic.com/))

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd MERN_ROLE
```

### 2. Set up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLAUDE_API_KEY=your_claude_api_key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:5000`

### 3. Set up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Usage

### Creating a New Form

1. Click on "Create New Form" in the dashboard
2. Enter a title and description for your form
3. Add form fields manually or use the "AI Generate Form" button to get AI suggestions
4. Customize the form fields as needed
5. Click "Save Form" when done

### Generating Forms with AI

1. In the form builder, click the "AI Generate Form" button
2. Enter a description of the form you want to create (e.g., "Customer feedback form for an e-commerce website")
3. Adjust the number of questions using the slider
4. Click "Generate Form" to see AI-suggested form fields
5. Customize the generated fields as needed

### Analyzing Responses

1. From the dashboard, click on "View Analytics" for the form you want to analyze
2. View response statistics and visualizations
3. Use the export button to download response data as CSV

## Project Structure

```
MERN_ROLE/
├── backend/               # Backend server
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── server.js         # Express server setup
│   └── package.json
│
└── frontend/             # Frontend React application
    ├── public/
    ├── src/
    │   ├── components/   # Reusable React components
    │   ├── App.jsx       # Main App component
    │   └── main.jsx      # Entry point
    └── package.json
```

## Environment Variables

### Backend

- `PORT`: Port for the backend server (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `CLAUDE_API_KEY`: Your Claude API key from Anthropic

## API Endpoints

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

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Claude API (Anthropic)

### Frontend
- React
- React Router
- Tailwind CSS
- DnD Kit (for drag and drop)
- Chart.js (for data visualization)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Anthropic](https://www.anthropic.com/) for the Claude API
- [MongoDB](https://www.mongodb.com/) for the database
- [React](https://reactjs.org/) and [Express](https://expressjs.com/) for the web framework
- [Chart.js](https://www.chartjs.org/) for data visualization
