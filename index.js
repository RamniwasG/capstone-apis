const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/project');

// Global Error Handler
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const app = express();

app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(morgan('dev'));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
}));

require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

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