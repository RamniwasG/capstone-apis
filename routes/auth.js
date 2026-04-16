const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Signup route
router.post('/signup', userController.signup);

// Signin route
router.post('/signin', userController.signin);

module.exports = router;