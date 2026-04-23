const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../middlewares/authMiddleware');
const AppError = require('../utils/AppError');
const { validateSignupData, validateSigninData } = require('../utils/customValidator');

const signup = async (req, res) => {
    try {
        const { username, password, email, phone, role } = req.body;

        validateSignupData({ username, password, email, phone });

        // prevent accedently adding more than one admin
        if(role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                throw new AppError('An admin already exists', 400);
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new AppError('Username or email already exists', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword,
            email,
            phone,
            role: role || 'member',
            status: role === 'admin' ? 'active' : 'pending' // Admins are active by default, members are pending
        });

        await user.save();

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
};

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        validateSigninData({ username, password });

        // Find user by username or email
        const user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // only allow active users to login
        if(user.status !== 'active') {
            throw new AppError(`User account is not activated yet, Please check with admin`, 403);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = generateToken(user)

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
};

module.exports = {
    signup,
    signin
};