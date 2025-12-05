const mongoose = require('mongoose');
const ProductReview = require('../models/productReviews');
const Product = require('../models/products');

// Create a product review
exports.createProductReview = async (req, res) => {
    try {
        const reviewData = req.body;
        reviewData.userId = req.user.userId; // logged-in user

        const newReview = new ProductReview(reviewData);
        const savedReview = await newReview.save();

        await updateProductRating(reviewData.productId);

        res.status(201).json({
            message: "Product review created successfully",
            review: savedReview
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating product review", error: error.message });
    }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        const filter = productId ? { productId } : {};
        const reviews = await ProductReview.find(filter)
            .populate('userId', 'name email');

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product reviews", error: error.message });
    }
};

// Get review by ID
exports.getProductReviewById = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await ProductReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Product review not found" });

        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product review", error: error.message });
    }
};

// Update a review
exports.updateProductReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reviewId = req.params.id;
        const updateData = req.body;

        const review = await ProductReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Product review not found" });

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this review" });
        }

        const updatedReview = await ProductReview.findByIdAndUpdate(reviewId, updateData, { new: true });
        await updateProductRating(updatedReview.productId);

        res.status(200).json({ message: "Product review updated successfully", review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: "Error updating product review", error: error.message });
    }
};

// Delete a review
exports.deleteProductReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;

        const review = await ProductReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Product review not found" });

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        await review.deleteOne();
        await updateProductRating(review.productId);

        res.status(200).json({ message: "Product review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product review", error: error.message });
    }
};

// --- Helper function to update product rating ---
async function updateProductRating(productId) {
    productId = new mongoose.Types.ObjectId(productId);

    const stats = await ProductReview.aggregate([
        { $match: { productId } },
        {
            $group: {
                _id: "$productId",
                avgRating: { $avg: "$rating" },
                count: { $sum: 1 }
            }
        }
    ]);

    const updateData = stats.length
        ? { rating: stats[0].avgRating, reviewsCount: stats[0].count }
        : { rating: 0, reviewsCount: 0 };

    const productObj = await Product.findById(productId);
    const result = await Product.findByIdAndUpdate(productId, updateData, { new: true });
}

