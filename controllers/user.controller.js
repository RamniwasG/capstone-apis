const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        return res.status(200).json({ users });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
};

// update user profile (username, email, phone) - only for the user themselves or admin
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if(req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            throw new AppError('You can only update your own profile', 403);
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();

        return res.status(200).json({
            message: 'User profile updated successfully',
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
}

// admin can update user status to active, pending, or suspended
const updateStatusByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['pending', 'active', 'suspended'].includes(status)) {
            throw new AppError('Invalid status value', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if(req.user.role !== 'admin') {
            throw new AppError('Only admins can update user status', 403);
        }

        user.status = status;
        await user.save();

        return res.status(200).json({
            message: 'User status updated successfully',
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
    getAllUsers,
    updateProfile,
    updateStatusByAdmin
};