const express = require('express');
const productReviewsController = require('../controllers/productReviews');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Public route
router.get('/', productReviewsController.getProductReviews);
router.get('/:id', productReviewsController.getProductReviewById);

// Protected routes
router.post('/', auth, productReviewsController.createProductReview);
router.put('/:id', auth, productReviewsController.updateProductReview);
router.delete('/:id', auth, productReviewsController.deleteProductReview);

module.exports = router;
