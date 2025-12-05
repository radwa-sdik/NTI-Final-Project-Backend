const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage (store file in memory buffer)
const storage = multer.memoryStorage();

// Accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'), false);
};

// Multer instance
const upload = multer({ storage, fileFilter });

// Middleware wrapper to upload image to Cloudinary
const uploadMiddleware = (req, res, next) => {
    upload.single('productImage')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                message: 'Image upload error',
                error: err.message,
            });
        }

        if (req.file) {
            try {
                // Upload image buffer to Cloudinary
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'products' }, // Cloudinary folder
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });

                // Save Cloudinary URL in req.file
                req.file.path = result.secure_url;
            } catch (uploadError) {
                return res.status(500).json({
                    message: 'Cloudinary upload failed',
                    error: uploadError.message,
                });
            }
        }

        next();
    });
};

module.exports = uploadMiddleware;
