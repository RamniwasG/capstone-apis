const Task = require('../models/task.model');
const AppError = require('../utils/AppError');

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('projectId', 'name').populate('assignedTo', 'username email -password');
        return res.status(200).json({ tasks });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ projectId }).populate('projectId', 'name').populate('assignedTo', 'username email -password');
        return res.status(200).json({ tasks });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignedTo, priority } = req.body;

        // Check if task with the same title already exists in the project
        const existingTask = await Task.findOne({ title, projectId });
        if (existingTask) {
            throw new AppError('Task title already exists in this project', 409);
        }

        const task = new Task({
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
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const updateTask = async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const { title, description, priority } = req.body;

        const task = await Task.findOne({ _id: taskId, projectId });
        if (!task) {
            throw new AppError('Task not found in this project', 404);
        }

        if (title) {
            // Check if another task with the same title exists in the project
            const existingTask = await Task.findOne({ title, projectId, _id: { $ne: taskId } });
            if (existingTask) {
                throw new AppError('Another task with the same title already exists in this project', 409);
            }
            task.title = title;
        }
        if (description) task.description = description;
        if (priority) task.priority = priority;

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
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const assignTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignedTo } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            throw new AppError('Task not found', 404);
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
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            throw new AppError('Invalid status value', 400);
        }

        const task = await Task.findById(taskId);
        if (!task) {
            throw new AppError('Task not found', 404);
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
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            throw new AppError('Task not found', 404);
        }

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

module.exports = {
    getAllTasks,
    getProjectTasks,
    createTask,
    updateTask,
    assignTask,
    updateTaskStatus,
    deleteTask
};