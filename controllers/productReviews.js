const productReviewModel = require('../models/productReviews');

exports.createProductReview = async (req, res) => {
    const reviewData = req.body;
    reviewData.userId = req.user.userId;
    try {
        const newReview = new productReviewModel(reviewData);
        const savedReview = await newReview.save();
        res.status(201).json({ message: "Product review created successfully", review: savedReview });
    } catch (error) {
        res.status(500).json({ message: "Error creating product review", error: error.message });
    }
};
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        const filter = productId ? { productId } : {};
        const reviews = await productReviewModel.find(filter).populate('userId', 'name email');
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product reviews", error: error.message });
    }
};
exports.getProductReviewById = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await productReviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Product review not found" });
        }
        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product review", error: error.message });
    }
};
exports.updateProductReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reviewId = req.params.id;
        const updateData = req.body;
        if (updateData.userId && updateData.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this review" });
        }
        const updatedReview = await productReviewModel.findByIdAndUpdate(reviewId, updateData, { new: true });
        if (!updatedReview) {
            return res.status(404).json({ message: "Product review not found" });
        }
        res.status(200).json({ message: "Product review updated successfully", review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: "Error updating product review", error: error.message });
    }
};
exports.deleteProductReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;
        const review = await productReviewModel.findById(reviewId);
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }
        const deletedReview = await review.remove();
        if (!deletedReview) {
            return res.status(404).json({ message: "Product review not found" });
        }
        res.status(200).json({ message: "Product review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product review", error: error.message });
    }
};
