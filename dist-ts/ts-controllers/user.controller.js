"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdsByEmails = exports.updateStatusByAdmin = exports.updateProfile = exports.getAllMembers = void 0;
const user_model_1 = __importDefault(require("../ts-models/user.model"));
const AppError_1 = __importDefault(require("../ts-utils/AppError"));
const getAllMembers = async (req, res) => {
    try {
        const users = await user_model_1.default.find({ role: { $ne: 'admin' } }).select('-password');
        return res.status(200).json({ users });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.getAllMembers = getAllMembers;
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, phone } = req.body;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new AppError_1.default('User not found', 404);
        }
        if (!req.user) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            throw new AppError_1.default('You can only update your own profile', 403);
        }
        if (username)
            user.username = username;
        if (phone)
            user.phone = phone;
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.updateProfile = updateProfile;
const updateStatusByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        if (!['pending', 'active', 'suspended'].includes(status)) {
            throw new AppError_1.default('Invalid status value', 400);
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new AppError_1.default('User not found', 404);
        }
        if (!req.user || req.user.role !== 'admin') {
            throw new AppError_1.default('Only admins can update user status', 403);
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.updateStatusByAdmin = updateStatusByAdmin;
const getUserIdsByEmails = async (req, res) => {
    try {
        const { emails } = req.body;
        console.log('Received emails for user ID retrieval:', emails);
        const users = await user_model_1.default.find({ email: { $in: emails } });
        if (!users || users.length === 0) {
            throw new AppError_1.default('members email not found!, please provide active and valid emails', 404);
        }
        if (`${users.length}` !== `${emails.length}`) {
            const foundEmails = users.map((user) => user.email);
            const notFoundEmails = emails.filter((email) => !foundEmails.includes(email));
            throw new AppError_1.default(`Users with following emails not found: ${notFoundEmails.join(', ')}`, 404);
        }
        return res.status(200).json({ userIds: users.map((user) => user._id) });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.getUserIdsByEmails = getUserIdsByEmails;
