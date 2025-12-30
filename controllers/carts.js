const cartModel = require('../models/cart');
const productModel = require('../models/products');


exports.getCartByUserId = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await cartModel.findOne({ userId }).populate('items.productId');
        if (!cart) {
            //create a new cart if not found
            const newCart = new cartModel({ userId, items: [] });
            await newCart.save();
            return res.status(200).json(newCart);
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;

        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            cart = new cartModel({ userId, items: [] }); 
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Product does not exist in cart, add new item
            cart.items.push({ productId, quantity, priceBerUnit: product.price });
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.items = [];
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;
        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.items[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};