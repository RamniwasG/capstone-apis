import { Request, Response } from 'express';
import Project from '../ts-models/project.model';
import AppError from '../ts-utils/AppError';
import { AuthenticatedRequest } from '../ts-types';

const getAllProjects = async (req: Request, res: Response): Promise<Response> => {
    try {
        const projects = await Project.find()
            .populate('createdBy', 'username email -password')
            .populate('members', 'username email -password');
        return res.status(200).json({ projects });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const getMemberProjects = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            throw new AppError('User not authenticated', 401);
        }

        const loggedInUserId = req.user.id;
        const projects = await Project.find({ members: { $in: [loggedInUserId] } })
            .populate('createdBy', 'username email -password')
            .populate('members', 'username email -password');
        return res.status(200).json({ projects });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const createProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { name, description } = req.body as {
            name: string;
            description?: string;
        };

        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            throw new AppError('Project name already exists', 409);
        }

        if (!req.user) {
            throw new AppError('User not authenticated', 401);
        }

        console.log(req.user);
        const project = new Project({
            name,
            description,
            createdBy: req.user.id
        });

        await project.save();

        return res.status(201).json({
            message: 'Project created successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body as {
            name?: string;
            description?: string;
        };

        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        if (!req.user || req.user.role !== 'admin') {
            throw new AppError('You do not have permission to update this project', 403);
        }

        if (name) {
            const existingProject = await Project.findOne({ name, _id: { $ne: projectId } });
            if (existingProject) {
                throw new AppError('Project name already exists', 409);
            }
            project.name = name;
        }

        if (description) project.description = description;

        await project.save();

        return res.status(200).json({
            message: 'Project updated successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { projectId } = req.params;

        if (!req.user || req.user.role !== 'admin') {
            throw new AppError('You do not have permission to delete this project', 403);
        }

        const project = await Project.findByIdAndDelete(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        return res.status(200).json({
            message: 'Project deleted successfully'
        });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const assignMembers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { projectId } = req.params;
        const { memberIds } = req.body as { memberIds: string[] };

        if (Array.isArray(memberIds) === false) {
            throw new AppError('memberIds should be an array of user IDs', 400);
        }

        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        if (!req.user || req.user.role !== 'admin') {
            throw new AppError('You do not have permission to assign members to this project', 403);
        }

        memberIds.forEach((memberId) => {
            const alreadyExists = project.members.some(
                (existingMemberId) => existingMemberId.toString() === memberId
            );

            if (!alreadyExists) {
                project.members.push(memberId as never);
            }
        });

        await project.save();

        return res.status(200).json({
            message: `Member${memberIds.length > 1 ? 's' : ''} assigned successfully`,
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

const removeMembers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { projectId } = req.params;
        const { memberIds } = req.body as { memberIds: string[] };

        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        if (!req.user || req.user.role !== 'admin') {
            throw new AppError('You do not have permission to remove members from this project', 403);
        }

        project.members = project.members.filter((memberId) => !memberIds.includes(memberId.toString()));

        await project.save();

        return res.status(200).json({
            message: `Member${project.members.length < memberIds.length ? 's' : ''} removed successfully`,
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        const appError = error as Error;
        throw new AppError(appError.message || 'Internal Server Error', 500);
    }
};

export {
    getAllProjects,
    getMemberProjects,
    createProject,
    updateProject,
    assignMembers,
    removeMembers,
    deleteProject
};
