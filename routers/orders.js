const express = require('express');
const ordersController = require('../controllers/orders');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

const router = express.Router();

// Protected routes - User must be authenticated
router.get('/', auth, ordersController.getOrdersByUserId);

// Admin routes
router.get('/all', auth, authorizeRoles('Admin'), ordersController.getAllOrders);
router.put('/:orderId/updateStatus', auth, authorizeRoles('Admin'), ordersController.updateOrderStatus);

module.exports = router;
