import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_CLOUD_URI;

        if (!mongoUri) {
            throw new Error('MONGO_CLOUD_URI is not configured');
        }

        await mongoose.connect(mongoUri);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;
