const productModel = require("../models/product");

exports.createProduct = async (req, res) => {
    const productData = req.body;
    try {
        const newProduct = new productModel(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: "Product created successfully", product: savedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};
exports.getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);
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
        const updateData = req.body;
        const updatedProduct = await productModel.findByIdAndUpdate(productId, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await productModel.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};
exports.searchProducts = async (req, res) => {
    try {
        const { name, minPrice, maxPrice, inStock, categories } = req.query;
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
        const products = await productModel.find(filter);
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Error searching products", error: error.message });
    }
};
