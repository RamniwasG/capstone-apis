"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../ts-models/user.model"));
const authMiddleware_1 = require("../ts-middlewares/authMiddleware");
const AppError_1 = __importDefault(require("../ts-utils/AppError"));
const customValidator_1 = require("../ts-utils/customValidator");
const signup = async (req, res) => {
    try {
        const { username, password, email, phone, role } = req.body;
        (0, customValidator_1.validateSignupData)({ username, password, email, phone });
        if (role === 'admin') {
            const existingAdmin = await user_model_1.default.findOne({ role: 'admin' });
            if (existingAdmin) {
                throw new AppError_1.default('An admin already exists', 400);
            }
        }
        const existingUser = await user_model_1.default.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new AppError_1.default('Username or email already exists', 409);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = new user_model_1.default({
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        (0, customValidator_1.validateSigninData)({ username, password });
        const user = await user_model_1.default.findOne({ $or: [{ username }, { email: username }] });
        if (!user) {
            throw new AppError_1.default('Invalid credentials', 401);
        }
        if (user.status !== 'active') {
            throw new AppError_1.default('User account is not activated yet, Please check with admin', 403);
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new AppError_1.default('Invalid credentials', 401);
        }
        const token = (0, authMiddleware_1.generateToken)({
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.signin = signin;
