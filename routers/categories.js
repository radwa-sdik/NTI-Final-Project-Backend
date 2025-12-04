const express = require('express');
const categoriesController = require('../controllers/categories');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

const router = express.Router();

// Public routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/:id/subcategories', categoriesController.getSubcategories);

// Protected routes - Admin only
router.post('/', auth, authorizeRoles('Admin'), categoriesController.createCategory);
router.put('/:id', auth, authorizeRoles('Admin'), categoriesController.updateCategory);
router.delete('/:id', auth, authorizeRoles('Admin'), categoriesController.deleteCategory);

module.exports = router;
