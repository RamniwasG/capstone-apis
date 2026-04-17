const validator = require('validator');
const AppError = require('./AppError');

const validateSignupData = (data) => {
    const { username, password, email, phone } = data;

    if (!username || !password || !email || !phone) {
        throw new AppError('All fields are required', 400);
    }

    if (!validator.isEmail(email)) {
        throw new AppError('Please provide a valid email', 400);
    }

    if (!validator.isMobilePhone(phone, "en-IN")) {
        throw new AppError("Invalid Indian phone number", 400);
    }

    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        throw new AppError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character", 400);
    }
};

const validateSigninData = (data) => {
    const { username, password } = data;

    if (!username || !password) {
        throw new AppError('Username and password are required', 400);
    }
}

module.exports = {
    validateSignupData,
    validateSigninData
};