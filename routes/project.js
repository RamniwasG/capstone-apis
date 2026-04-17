const express = require('express');
const { isAuthenticated, authorizeRole } = require('../middlewares/authMiddleware');
const projectController = require('../controllers/project.controller');

const router = express.Router();

router.get('/getAll', isAuthenticated, authorizeRole('admin'), projectController.getAllProjects);

router.get('/getMemberProjects', isAuthenticated, projectController.getMemberProjects);

router.post('/create', isAuthenticated, authorizeRole('admin'), projectController.createProject);

router.patch('/update/:projectId', isAuthenticated, authorizeRole('admin'), projectController.updateProject);

router.delete('/delete/:projectId', isAuthenticated, authorizeRole('admin'), projectController.deleteProject);

router.post('/:projectId/add-member', isAuthenticated, authorizeRole('admin'), projectController.assignMembers);

router.post('/:projectId/remove-member', isAuthenticated, authorizeRole('admin'), projectController.removeMembers);  

module.exports = router;