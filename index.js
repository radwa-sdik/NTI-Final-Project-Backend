const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const usersRouter = require('./routers/users');
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const cartsRouter = require('./routers/carts');
const ordersRouter = require('./routers/orders');
const addressesRouter = require('./routers/addresses');
const productReviewsRouter = require('./routers/productReviews');
const conversationsRouter = require('./routers/conversations');
const paymentRouter = require('./routers/payment');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/reviews', productReviewsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/payment', paymentRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});