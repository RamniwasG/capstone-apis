"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTaskStatus = exports.assignTask = exports.updateTask = exports.createTask = exports.getProjectTasks = exports.getAllTasks = void 0;
const task_model_1 = __importDefault(require("../ts-models/task.model"));
const AppError_1 = __importDefault(require("../ts-utils/AppError"));
const getAllTasks = async (req, res) => {
    try {
        const tasks = await task_model_1.default.find().populate('projectId', 'name').populate('assignedTo', 'username email -password');
        return res.status(200).json({ tasks });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.getAllTasks = getAllTasks;
const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await task_model_1.default.find({ projectId }).populate('projectId', 'name').populate('assignedTo', 'username email -password');
        return res.status(200).json({ tasks });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.getProjectTasks = getProjectTasks;
const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignedTo, priority } = req.body;
        const existingTask = await task_model_1.default.findOne({ title, projectId });
        if (existingTask) {
            throw new AppError_1.default('Task title already exists in this project', 409);
        }
        const task = new task_model_1.default({
            title,
            description,
            priority,
            projectId,
            assignedTo
        });
        await task.save();
        return res.status(201).json({
            message: 'Task created successfully',
            task: {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assignedTo: task.assignedTo
            }
        });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const { title, description, priority, assignedTo } = req.body;
        const task = await task_model_1.default.findOne({ _id: taskId, projectId });
        if (!task) {
            throw new AppError_1.default('Task not found in this project', 404);
        }
        if (title) {
            const existingTask = await task_model_1.default.findOne({ title, projectId, _id: { $ne: taskId } });
            if (existingTask) {
                throw new AppError_1.default('Another task with the same title already exists in this project', 409);
            }
            task.title = title;
        }
        if (description)
            task.description = description;
        if (priority)
            task.priority = priority;
        if (assignedTo)
            task.assignedTo = assignedTo;
        await task.save();
        return res.status(200).json({
            message: 'Task updated successfully',
            task: {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assignedTo: task.assignedTo
            }
        });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.updateTask = updateTask;
const assignTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignedTo } = req.body;
        const task = await task_model_1.default.findById(taskId);
        if (!task) {
            throw new AppError_1.default('Task not found', 404);
        }
        task.assignedTo = assignedTo;
        await task.save();
        return res.status(200).json({
            message: 'Task assigned successfully',
            task: {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assignedTo: task.assignedTo
            }
        });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.assignTask = assignTask;
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            throw new AppError_1.default('Invalid status value', 400);
        }
        const task = await task_model_1.default.findById(taskId);
        if (!task) {
            throw new AppError_1.default('Task not found', 404);
        }
        task.status = status;
        await task.save();
        return res.status(200).json({
            message: 'Task status updated successfully',
            task: {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assignedTo: task.assignedTo
            }
        });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.updateTaskStatus = updateTaskStatus;
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await task_model_1.default.findByIdAndDelete(taskId);
        if (!task) {
            throw new AppError_1.default('Task not found', 404);
        }
        return res.status(200).json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.deleteTask = deleteTask;
