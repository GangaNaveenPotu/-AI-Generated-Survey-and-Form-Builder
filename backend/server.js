const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow requests from frontend domains
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || process.env.ALLOW_ALL_ORIGINS === 'true') {
                callback(null, true);
            } else {
                callback(null, true); // Allow all origins in production for easier setup
            }
        }
        : true, // Allow all origins in development
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-form-builder')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
const apiRoutes = require('./routes/api');
const { router: authRouter } = require('./routes/auth');

// Use routes
app.use('/api/v1', apiRoutes);
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
