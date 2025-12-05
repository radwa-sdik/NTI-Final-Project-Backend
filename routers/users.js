const express = require('express');
const usersController = require('../controllers/users');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

// Public routes
router.post('/register', usersController.createUser);
router.post('/login', usersController.loginUser);

// Protected routes
router.get('/:id', auth, authorizeRoles('Admin'), usersController.getUserById);
router.get('/', auth, authorizeRoles('Admin'), usersController.getAllUsers);

module.exports = router;
