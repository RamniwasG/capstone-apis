import mongoose, { Schema, Types } from 'mongoose';

export interface IProject {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    members: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: [true, 'Project name is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Project name must be at least 3 characters'],
            maxlength: [50, 'Project name must not exceed 50 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description must not exceed 500 characters']
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
