import express from 'express';
import { authorizeRole, isAuthenticated } from '../ts-middlewares/authMiddleware';
import * as taskController from '../ts-controllers/task.controller';

const router = express.Router();

router.get('/getAll', isAuthenticated, authorizeRole('admin'), taskController.getAllTasks);
router.get('/:projectId', isAuthenticated, authorizeRole('admin', 'member'), taskController.getProjectTasks);
router.post('/:projectId/create', isAuthenticated, authorizeRole('admin', 'member'), taskController.createTask);
router.put('/:projectId/update/:taskId', isAuthenticated, authorizeRole('admin', 'member'), taskController.updateTask);
router.patch('/assign/:taskId', isAuthenticated, authorizeRole('admin', 'member'), taskController.assignTask);
router.patch('/status/:taskId', isAuthenticated, authorizeRole('admin', 'member'), taskController.updateTaskStatus);
router.delete('/delete/:taskId', isAuthenticated, authorizeRole('admin'), taskController.deleteTask);

export default router;
