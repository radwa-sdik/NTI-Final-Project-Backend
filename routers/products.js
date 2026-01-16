const express = require('express');
const productsController = require('../controllers/products');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
const uploadMiddleware = require('../middlewares/upload'); // multer middleware

const router = express.Router();

// Public routes
router.get('/', productsController.getAllProductsPaginated);
router.get('/:id', productsController.getProductById);

// Protected routes - Admin only
router.post('/', auth, authorizeRoles('Admin'), productsController.createProduct);

router.put('/:id', auth, authorizeRoles('Admin'), productsController.updateProduct);
router.delete('/:id', auth, authorizeRoles('Admin'), productsController.deleteProduct);
router.post('/:id/images', auth, authorizeRoles('Admin'), productsController.addProductImage);

module.exports = router;
