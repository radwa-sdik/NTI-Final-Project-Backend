const orderModel = require('../models/orders');
const cartModel = require('../models/cart');
const userModel = require('../models/users');

// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await orderModel.find({ userId }).populate('products.productId').populate('addressId');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { status } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.find().populate('products.productId').populate('addressId');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};