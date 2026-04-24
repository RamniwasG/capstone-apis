"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.removeMembers = exports.assignMembers = exports.updateProject = exports.createProject = exports.getMemberProjects = exports.getAllProjects = void 0;
const project_model_1 = __importDefault(require("../ts-models/project.model"));
const AppError_1 = __importDefault(require("../ts-utils/AppError"));
const getAllProjects = async (req, res) => {
    try {
        const projects = await project_model_1.default.find()
            .populate('createdBy', 'username email -password')
            .populate('members', 'username email -password');
        return res.status(200).json({ projects });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.getAllProjects = getAllProjects;
const getMemberProjects = async (req, res) => {
    try {
        if (!req.user) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        const loggedInUserId = req.user.id;
        const projects = await project_model_1.default.find({ members: { $in: [loggedInUserId] } })
            .populate('createdBy', 'username email -password')
            .populate('members', 'username email -password');
        return res.status(200).json({ projects });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.getMemberProjects = getMemberProjects;
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingProject = await project_model_1.default.findOne({ name });
        if (existingProject) {
            throw new AppError_1.default('Project name already exists', 409);
        }
        if (!req.user) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        console.log(req.user);
        const project = new project_model_1.default({
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        const project = await project_model_1.default.findById(projectId);
        if (!project) {
            throw new AppError_1.default('Project not found', 404);
        }
        if (!req.user || req.user.role !== 'admin') {
            throw new AppError_1.default('You do not have permission to update this project', 403);
        }
        if (name) {
            const existingProject = await project_model_1.default.findOne({ name, _id: { $ne: projectId } });
            if (existingProject) {
                throw new AppError_1.default('Project name already exists', 409);
            }
            project.name = name;
        }
        if (description)
            project.description = description;
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!req.user || req.user.role !== 'admin') {
            throw new AppError_1.default('You do not have permission to delete this project', 403);
        }
        const project = await project_model_1.default.findByIdAndDelete(projectId);
        if (!project) {
            throw new AppError_1.default('Project not found', 404);
        }
        return res.status(200).json({
            message: 'Project deleted successfully'
        });
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.deleteProject = deleteProject;
const assignMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { memberIds } = req.body;
        if (Array.isArray(memberIds) === false) {
            throw new AppError_1.default('memberIds should be an array of user IDs', 400);
        }
        const project = await project_model_1.default.findById(projectId);
        if (!project) {
            throw new AppError_1.default('Project not found', 404);
        }
        if (!req.user || req.user.role !== 'admin') {
            throw new AppError_1.default('You do not have permission to assign members to this project', 403);
        }
        memberIds.forEach((memberId) => {
            const alreadyExists = project.members.some((existingMemberId) => existingMemberId.toString() === memberId);
            if (!alreadyExists) {
                project.members.push(memberId);
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.assignMembers = assignMembers;
const removeMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { memberIds } = req.body;
        const project = await project_model_1.default.findById(projectId);
        if (!project) {
            throw new AppError_1.default('Project not found', 404);
        }
        if (!req.user || req.user.role !== 'admin') {
            throw new AppError_1.default('You do not have permission to remove members from this project', 403);
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
    }
    catch (error) {
        const appError = error;
        throw new AppError_1.default(appError.message || 'Internal Server Error', 500);
    }
};
exports.removeMembers = removeMembers;
