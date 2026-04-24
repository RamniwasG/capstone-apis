import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../ts-models/user.model';
import { generateToken } from '../ts-middlewares/authMiddleware';
import AppError from '../ts-utils/AppError';
import { validateSigninData, validateSignupData } from '../ts-utils/customValidator';

const signup = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, password, email, phone, role } = req.body as {
            username: string;
            password: string;
            email: string;
            phone: string;
            role?: 'admin' | 'member';
        };

        validateSignupData({ username, password, email, phone });

        if (role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                throw new AppError('An admin already exists', 400);
            }
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new AppError('Username or email already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword,
            email,
            phone,
            role: role || 'member',
            status: role === 'admin' ? 'active' : 'pending'
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
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const signin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, password } = req.body as {
            username: string;
            password: string;
        };

        validateSigninData({ username, password });

        const user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (user.status !== 'active') {
            throw new AppError('User account is not activated yet, Please check with admin', 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });

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
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

export {
    signup,
    signin
};
