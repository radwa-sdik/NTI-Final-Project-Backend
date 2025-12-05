const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
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
const messagesRouter = require('./routers/messages');
const paymentRouter = require('./routers/payment');

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store connected socket ids by userId
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("register", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log("Registered:", userId);
    });

    socket.on("disconnect", () => {
        for (const [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        console.log("User disconnected", socket.id);
    });
});

// Add to req object
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

// Use routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/reviews', productReviewsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/payment', paymentRouter);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});