const jwt = require('jsonwebtoken');
require('dotenv').config({
    quiet: true,
    path: [".env", ".env.local"]
});

const {
    JWT_SECRET,
    JWT_EXPIRES_IN = '1h'
} = process.env;

// Middleware to verify JWT token
const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Middleware to authorize based on user role
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

module.exports = {
    isAuthenticated,
    authorizeRole,
    generateToken,
};