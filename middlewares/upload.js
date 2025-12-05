const multer = require('multer');
const path = require('path');

// folder for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/products/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
};

// ✅ FIX: create multer instance
const upload = multer({ storage, fileFilter });

// middleware wrapper to catch errors
const uploadMiddleware = (req, res, next) => {
    upload.single('productImage')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: "Image upload error",
                error: err.message
            });
        }
        next();
    });
};

module.exports = uploadMiddleware;
