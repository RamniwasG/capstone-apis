import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './ts-config/db';
import globalErrorHandler from './ts-middlewares/globalErrorHandler';
import authRoutes from './ts-routes/auth';
import userRoutes from './ts-routes/users';
import projectRoutes from './ts-routes/project';
import taskRoutes from './ts-routes/task';

const app = express();
const env = process.env.NODE_ENV || 'development';

dotenv.config({
    quiet: true,
    path: env === 'production' ? '.env.production' : '.env'
});

const {
    PORT = '5000',
    RATE_LIMIT_WINDOW_MS = '900000',
    MAX_REQUEST_PER_IP = '100'
} = process.env;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.use(
    rateLimit({
        windowMs: Number(RATE_LIMIT_WINDOW_MS),
        max: Number(MAX_REQUEST_PER_IP),
        message: 'Too many requests from this IP, please try again later.'
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: '404, Route not found' });
});

app.use(globalErrorHandler);

connectDB()
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(Number(PORT), () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err: unknown) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
