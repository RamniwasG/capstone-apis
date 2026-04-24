"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./ts-config/db"));
const globalErrorHandler_1 = __importDefault(require("./ts-middlewares/globalErrorHandler"));
const auth_1 = __importDefault(require("./ts-routes/auth"));
const users_1 = __importDefault(require("./ts-routes/users"));
const project_1 = __importDefault(require("./ts-routes/project"));
const task_1 = __importDefault(require("./ts-routes/task"));
const app = (0, express_1.default)();
const env = process.env.NODE_ENV || 'development';
dotenv_1.default.config({
    quiet: true,
    path: env === 'production' ? '.env.production' : '.env'
});
const { PORT = '5000', RATE_LIMIT_WINDOW_MS = '900000', MAX_REQUEST_PER_IP = '100' } = process.env;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, express_rate_limit_1.default)({
    windowMs: Number(RATE_LIMIT_WINDOW_MS),
    max: Number(MAX_REQUEST_PER_IP),
    message: 'Too many requests from this IP, please try again later.'
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/projects', project_1.default);
app.use('/api/tasks', task_1.default);
app.use((req, res) => {
    res.status(404).json({ error: '404, Route not found' });
});
app.use(globalErrorHandler_1.default);
(0, db_1.default)()
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(Number(PORT), () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});
