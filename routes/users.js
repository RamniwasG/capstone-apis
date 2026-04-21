const express = require('express');
const { isAuthenticated, authorizeRole } = require('../middlewares/authMiddleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/', isAuthenticated, authorizeRole('admin'), userController.getAllUsers);

router.post('/emails-to-ids', isAuthenticated, authorizeRole('admin'), userController.getUserIdsByEmails);

router.patch('/update/:userId/status', isAuthenticated, authorizeRole('admin'), userController.updateStatusByAdmin);

router.patch('/update/:userId/profile', isAuthenticated, userController.updateProfile);

module.exports = router;