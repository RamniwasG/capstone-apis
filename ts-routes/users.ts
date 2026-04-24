import express from 'express';
import { authorizeRole, isAuthenticated } from '../ts-middlewares/authMiddleware';
import * as userController from '../ts-controllers/user.controller';

const router = express.Router();

router.get('/all-members', isAuthenticated, authorizeRole('admin'), userController.getAllMembers);
router.post('/emails-to-ids', isAuthenticated, authorizeRole('admin'), userController.getUserIdsByEmails);
router.patch('/update/:userId/status', isAuthenticated, authorizeRole('admin'), userController.updateStatusByAdmin);
router.put('/update/:userId/profile', isAuthenticated, authorizeRole('admin', 'member'), userController.updateProfile);

export default router;
