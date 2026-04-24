const express = require('express');
const { isAuthenticated, authorizeRole } = require('../middlewares/authMiddleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/all-members', isAuthenticated, authorizeRole('admin'), userController.getAllMembers);

router.post('/emails-to-ids', isAuthenticated, authorizeRole('admin'), userController.getUserIdsByEmails);

router.patch('/update/:userId/status', isAuthenticated, authorizeRole('admin'), userController.updateStatusByAdmin);

router.put('/update/:userId/profile', isAuthenticated, authorizeRole('admin', 'member'), userController.updateProfile);

module.exports = router;