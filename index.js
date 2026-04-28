const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');

// Global Error Handler
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const app = express();
const env = process.env.NODE_ENV || 'development';

require('dotenv').config({
    quiet: true,
    path: env === "production" ? ".env.production" : ".env"
});

const {
    PORT=5000,
    CORS_ORIGIN,
    CORS_CREDENTIALS,
    RATE_LIMIT_WINDOW_MS,
    MAX_REQUEST_PER_IP,
} = process.env

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.use(rateLimit({
    windowMs: parseInt(RATE_LIMIT_WINDOW_MS), // 15 minutes
    max: MAX_REQUEST_PER_IP, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: '404, Route not found' });
});

app.use(globalErrorHandler);

// MongoDB Connection
const connectDB = require('./config/db');
connectDB()
.then(() => {
    console.log('Connected to MongoDB');
    // Server Start
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit process with failure
});