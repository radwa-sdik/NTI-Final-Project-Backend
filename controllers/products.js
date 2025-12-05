const productModel = require("../models/products");
const ProductReview = require('../models/productReviews');

exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // If an image was uploaded
        if (req.file) {
            productData.productImages = [{
                imageUrl: `/uploads/products/${req.file.filename}`,
                isMain: true
            }];
        }

        const newProduct = new productModel(productData);
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating product",
            error: error.message
        });
    }
};

exports.getAllProductsPaginated = async (req, res) => {
    try {
        const { name, minPrice, maxPrice, inStock, categories} = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (minPrice) {
            filter.price = { ...filter.price, $gte: Number(minPrice) };
        }
        if (maxPrice) {
            filter.price = { ...filter.price, $lte: Number(maxPrice) };
        }
        if (inStock !== undefined) {
            filter.quantity = inStock === 'true' ? { $gt: 0 } : 0;
        }
        if (categories) {
            const list = categories.split(",");       
            filter.category = { $in: list };
        }
        const products = await productModel.find(filter).populate('category').skip(skip).limit(limit);
        const total = await productModel.countDocuments(filter);
        res.status(200).json({
            products,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Error searching products", error: error.message });
    }
};
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId).populate('category');
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
};
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = { ...req.body }; // clone req.body

        // ✅ Handle uploaded image
        if (req.file) {
            updateData.productImages = [{
                imageUrl: `/uploads/products/${req.file.filename}`,
                isMain: true
            }];
        }

        // Update product
        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true } // returns updated doc and validates fields
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            message: "Error updating product",
            error: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // 1️⃣ Delete the product
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 2️⃣ Delete all reviews for this product
        await ProductReview.deleteMany({ productId });

        res.status(200).json({
            message: "Product and related reviews deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting product",
            error: error.message
        });
    }
};


exports.addProductImage = async (req, res) => {
    try {
        const productId = req.params.id;
        const { imageUrl, isMain } = req.body;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        product.productImages.push({ imageUrl, isMain });
        await product.save();
        res.status(200).json({ message: "Image added successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error adding image", error: error.message });
    }
};