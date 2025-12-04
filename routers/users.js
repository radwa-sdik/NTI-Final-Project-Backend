const express = require('express');
const usersController = require('../controllers/users');
const router = express.Router();

// Public routes
router.post('/register', usersController.createUser);
router.post('/login', usersController.loginUser);

module.exports = router;
