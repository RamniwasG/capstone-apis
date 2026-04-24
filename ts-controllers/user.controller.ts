import { Request, Response } from 'express';
import User from '../ts-models/user.model';
import AppError from '../ts-utils/AppError';
import { AuthenticatedRequest } from '../ts-types';

const getAllMembers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        return res.status(200).json({ users });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const { username, phone } = req.body as {
            username?: string;
            phone?: string;
        };

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (!req.user) {
            throw new AppError('User not authenticated', 401);
        }

        if (req.user.role !== 'admin' && req.user.id !== userId) {
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
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const updateStatusByAdmin = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const { status } = req.body as { status: 'pending' | 'active' | 'suspended' };

        if (!['pending', 'active', 'suspended'].includes(status)) {
            throw new AppError('Invalid status value', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (!req.user || req.user.role !== 'admin') {
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
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const getUserIdsByEmails = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { emails } = req.body as { emails: string[] };
        console.log('Received emails for user ID retrieval:', emails);

        const users = await User.find({ email: { $in: emails } });
        if (!users || users.length === 0) {
            throw new AppError('members email not found!, please provide active and valid emails', 404);
        }

        if (`${users.length}` !== `${emails.length}`) {
            const foundEmails = users.map((user) => user.email);
            const notFoundEmails = emails.filter((email) => !foundEmails.includes(email));
            throw new AppError(`Users with following emails not found: ${notFoundEmails.join(', ')}`, 404);
        }

        return res.status(200).json({ userIds: users.map((user) => user._id) });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

export {
    getAllMembers,
    updateProfile,
    updateStatusByAdmin,
    getUserIdsByEmails
};
