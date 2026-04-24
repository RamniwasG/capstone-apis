"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSigninData = exports.validateSignupData = void 0;
const validator_1 = __importDefault(require("validator"));
const AppError_1 = __importDefault(require("./AppError"));
const validateSignupData = (data) => {
    const { username, password, email, phone } = data;
    if (!username || !password || !email || !phone) {
        throw new AppError_1.default('All fields are required', 400);
    }
    if (!validator_1.default.isEmail(email)) {
        throw new AppError_1.default('Please provide a valid email', 400);
    }
    if (!validator_1.default.isMobilePhone(phone, 'en-IN')) {
        throw new AppError_1.default('Invalid Indian phone number', 400);
    }
    if (!validator_1.default.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        throw new AppError_1.default('Password must be at least 8 characters and include uppercase, lowercase, number, and special character', 400);
    }
};
exports.validateSignupData = validateSignupData;
const validateSigninData = (data) => {
    const { username, password } = data;
    if (!username || !password) {
        throw new AppError_1.default('Username and password are required', 400);
    }
};
exports.validateSigninData = validateSigninData;
