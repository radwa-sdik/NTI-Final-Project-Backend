const categoryModel = require('../models/category');

exports.createCategory = async (req, res) => {
    const categoryData = req.body;
    try {
        const newCategory = new categoryModel(categoryData);
        const savedCategory = await newCategory.save();
        res.status(201).json({ message: "Category created successfully", category: savedCategory });
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ category });
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const updateData = req.body;
        const updatedCategory = await categoryModel.findByIdAndUpdate(categoryId, updateData, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};

exports.getSubcategories = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const subcategories = await categoryModel.find({ parentCategory: categoryId });
        res.status(200).json({ subcategories });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategories", error: error.message });
    }
};