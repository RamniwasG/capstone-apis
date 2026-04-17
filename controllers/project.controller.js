const Project = require('../models/project.model');
const AppError = require('../utils/AppError');

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('createdBy', 'username email -password').populate('members', 'username email -password');
        return res.status(200).json({ projects });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const getMemberProjects = async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user._id }).populate('createdBy', 'username email -password').populate('members', 'username email -password');
        return res.status(200).json({ projects });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if project with the same name already exists
        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            throw new AppError('Project name already exists', 409);
        }
        console.log(req.user)
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
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        
        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Only admin can update the project
        if (req.user.role !== 'admin') {
            throw new AppError('You do not have permission to update this project', 403);
        }

        if (name) {
            // Check if another project with the same name exists
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
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const deleteProject = async (req, res) => {
    try {        
        const { projectId } = req.params;

        // Only admin can delete the project
        if (req.user.role !== 'admin') {
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
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const assignMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { memberIds } = req.body; // array of user IDs to be added as members
        
        if(Array.isArray(memberIds) === false) {
            throw new AppError('memberIds should be an array of user IDs', 400);
        }

        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Only admin can assign members
        if (req.user.role !== 'admin') {
            throw new AppError('You do not have permission to assign members to this project', 403);
        }

        // Add new members to the project, avoiding duplicates
        memberIds.forEach(memberId => {
            if (!project.members.includes(memberId)) {
                project.members.push(memberId);
            }
        });

        await project.save();

        return res.status(200).json({
            message: 'Members assigned successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}

const removeMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { memberIds } = req.body; // array of user IDs to be removed from members

        const project = await Project.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Only admin can remove members
        if (req.user.role !== 'admin') {
            throw new AppError('You do not have permission to remove members from this project', 403);
        }

        // Remove specified members from the project
        project.members = project.members.filter(memberId => !memberIds.includes(memberId.toString()));

        await project.save();

        return res.status(200).json({
            message: 'Members removed successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        throw new AppError(error.message || 'Internal Server Error', 500);
    }
}


module.exports = {
    getAllProjects,
    getMemberProjects,
    createProject,
    updateProject,
    assignMembers,
    removeMembers,
    deleteProject
};