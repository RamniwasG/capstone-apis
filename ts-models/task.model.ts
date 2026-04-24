import mongoose, { Schema, Types } from 'mongoose';
import { TaskPriority, TaskStatus } from '../ts-types';

export interface ITask {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: Types.ObjectId;
    assignedTo?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            minlength: [3, 'Task title must be at least 3 characters'],
            maxlength: [100, 'Task title must not exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description must not exceed 500 characters']
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    },
    { timestamps: true }
);

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;
