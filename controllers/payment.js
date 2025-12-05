const payment = require("../models/payment");
const { client, ordersController, paymentsController } = require("../helpers/paypal.js");
const cartModel = require("../models/cart");
const orderModel = require("../models/orders");
const paymentModel = require("../models/payment");


exports.createPaypalOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { addressId } = req.body;

        const cart = await cartModel.findOne({ userId }).populate("items.productId");
        if (!cart || !cart.items.length)
            return res.status(400).json({ success: false, message: "Cart is empty" });

        const subtotal = cart.items.reduce(
            (sum, item) =>
                sum + (item.priceBerUnit || item.price) * item.quantity,
            0
        );

        const shipping = 10;
        const tax = subtotal * 0.1;
        const total = subtotal + shipping + tax;

        const orderPayload = {
            body: {
                intent: "CAPTURE",
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: "USD",
                            value: total.toFixed(2),
                            breakdown: {
                                itemTotal: {
                                    currencyCode: "USD",
                                    value: subtotal.toFixed(2),
                                },
                                shipping: {
                                    currencyCode: "USD",
                                    value: shipping.toFixed(2),
                                },
                                taxTotal: {
                                    currencyCode: "USD",
                                    value: tax.toFixed(2),
                                },
                            },
                        },

                        items: cart.items.map((p) => ({
                            name: p.productId.name,
                            quantity: p.quantity.toString(),
                            unitAmount: {
                                currencyCode: "USD",
                                value: (p.priceBerUnit || p.price).toFixed(2),
                            },
                        })),
                    },
                ],
            },
            prefer: "return=minimal",
        };

        console.log("Creating PayPal order with payload:", orderPayload.body.purchaseUnits[0].items);

        const { body, statusCode } = await ordersController.createOrder(orderPayload);

        return res.status(statusCode).json({
            paypalOrderId: JSON.parse(body).id,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed creating PayPal order",
            error: err.message,
        });
    }
};



exports.onPaypalApprove = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { paypalOrderId, addressId } = req.body;
        console.log("Received PayPal Order ID:", paypalOrderId);

        if (!paypalOrderId) {
            return res.status(400).json({
                success: false,
                message: "Missing PayPal order ID"
            });
        }

        // CAPTURE
        let captureResponse;
        try {
            captureResponse = await ordersController.captureOrder({
                id: paypalOrderId,
                prefer: "return=representation",
            });
        } catch (err) {
            console.error("PayPal Capture ERROR =>", err);

            // Return PayPal error directly
            return res.status(400).json({
                success: false,
                message: "PayPal capture failed",
                details: err.result || err.message
            });
        }

        const captureResult = JSON.parse(captureResponse.body);

        // VALIDATE CAPTURE STATUS
        const paypalStatus = captureResult.status;
        const captureDetails =
            captureResult.purchase_units?.[0]?.payments?.captures?.[0];

        if (!captureDetails || captureDetails.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Payment not completed",
                paypalStatus,
                captureStatus: captureDetails?.status,
            });
        }

        // READ CART
        const cart = await cartModel.findOne({ userId });
        if (!cart || !cart.items.length)
            return res.status(400).json({ success: false, message: "Cart empty" });

        const subTotal = cart.items.reduce(
            (sum, item) =>
                sum + (item.priceBerUnit || item.price) * item.quantity,
            0
        );
        const shipping = 10;
        const tax = subTotal * 0.1;
        const totalPrice = subTotal + shipping + tax;


        let products = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.priceBerUnit || item.price
        }));

        // CREATE ORDER
        const newOrder = await orderModel.create({
            userId,
            addressId,
            products: products,
            subTotal,
            shipping,
            tax,
            totalPrice
        });

        // CLEAR CART
        cart.items = [];
        await cart.save();

        // SAVE PAYMENT
        await paymentModel.create({
            userId,
            orderId: newOrder._id,
            method: "PayPal",
            amount: totalPrice,
            status: "COMPLETED",
            transactionId: captureDetails.id,
        });

        return res.json({
            success: true,
            message: "Payment captured & order created",
            order: newOrder,
        });

    } catch (err) {
        console.error("SERVER ERROR =>", err);
        res.status(500).json({
            success: false,
            message: "Server error while capturing payment",
            error: err.message,
        });
    }
};
