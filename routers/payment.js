const express = require('express');
const paymentController = require('../controllers/payment');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Protected routes - User must be authenticated
router.post('/paypal/create-order', auth, paymentController.createPaypalOrder);
router.post('/paypal/approve', auth, paymentController.onPaypalApprove);

module.exports = router;
