import mongoose, { Schema, Types } from 'mongoose';
import validator from 'validator';
import { UserRole, UserStatus } from '../ts-types';

export interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username must not exceed 30 characters'],
            validate: {
                validator: function (v: string): boolean {
                    return /^[a-zA-Z0-9_-]+$/.test(v);
                },
                message: 'Username can only contain letters, numbers, underscores, and hyphens'
            }
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            validate: {
                validator: function (value: string): boolean {
                    return validator.isEmail(value);
                },
                message: 'Please provide a valid email'
            }
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: true,
            validate: {
                validator: function (value: string): boolean {
                    return validator.isStrongPassword(value, {
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1,
                        minSymbols: 1
                    });
                },
                message:
                    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            }
        },
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            validate: {
                validator: function (value: string): boolean {
                    return validator.isMobilePhone(value, 'en-IN');
                },
                message: 'Invalid Indian phone number'
            }
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'suspended'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
