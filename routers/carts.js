const express = require('express');
const cartsController = require('../controllers/carts');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Protected routes - User must be authenticated
router.get('/', auth, cartsController.getCartByUserId);
router.post('/add', auth, cartsController.addToCart);
router.delete('/remove', auth, cartsController.removeFromCart);
router.delete('/clear', auth, cartsController.clearCart);

module.exports = router;
