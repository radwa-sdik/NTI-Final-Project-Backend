const payment = require("../models/payment");
const paypal = require("../helpers/paypal.js");


exports.createPaypalOrder = async (req, res) => {
    try {
        const userId = req.user.userId;

        // get cart total (never trust frontend)
        const cart = await cartModel.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: totalAmount.toFixed(2)
                    }
                }
            ]
        });

        const paypalOrder = await paypal.client().execute(request);

        res.json({ paypalOrderId: paypalOrder.result.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating PayPal order' });
    }
};



exports.onPaypalApprove = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { paypalOrderId, addressId } = req.body;

        // 1) Capture PayPal payment
        const captureReq = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        captureReq.requestBody({});
        
        let capture;
        try {
            capture = await paypal.client().execute(captureReq);
        } catch (err) {
            // Payment capture failed completely
            return res.status(400).json({
                success: false,
                message: "Payment capture failed",
                error: err.message,
            });
        }

        // 2) Check PayPal status
        const paypalStatus = capture.result.status;
        const paymentStatus = capture.result.purchase_units[0].payments.captures[0].status;

        if (paypalStatus !== "COMPLETED" || paymentStatus !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Payment not completed, order will not be created",
                paypalStatus,
                paymentStatus
            });
        }

        // 3) Payment is OK → create order
        const cart = await cartModel.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

        const newOrder = await orderModel.create({
            userId,
            addressId,
            products: cart.items,
            totalPrice
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        // Save payment record (optional)
        await payment.create({
            userId: userId,
            orderId: newOrder._id,
            method: "PayPal",
            amount: totalPrice,
            status: paymentStatus,
            transactionId: capture.result.id
        });

        return res.json({
            success: true,
            message: "Order created successfully",
            order: newOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.getPaymentsByUser = async (req, res) => {
    const userID = req.user.userID;
    try {
        const payments = await payment.find({ userID });
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payments", error: error.message });
    }
};
