const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const getAllMembers = async (req, res) => {
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
        const { username, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if(req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            throw new AppError('You can only update your own profile', 403);
        }

        if (username) user.username = username;
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

// get user ids for multiple email addresses (used for task assignment)
const getUserIdsByEmails = async (req, res) => {
    try {
        const { emails } = req.body;
        console.log('Received emails for user ID retrieval:', emails);
        const users = await User.find({ email: { $in: emails } });
        if(!users || users.length === 0) {
            throw new AppError('members email not found!, please provide active and valid emails', 404);
        }
        if(`${users.length}` !== `${emails.length}`) {
            const foundEmails = users.map(user => user.email);
            const notFoundEmails = emails.filter(email => !foundEmails.includes(email));
            throw new AppError(`Users with following emails not found: ${notFoundEmails.join(', ')}`, 404);
        }
        return res.status(200).json({ userIds: users.map(user => user._id) });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
};

module.exports = {
    getAllMembers,
    updateProfile,
    updateStatusByAdmin,
    getUserIdsByEmails
};