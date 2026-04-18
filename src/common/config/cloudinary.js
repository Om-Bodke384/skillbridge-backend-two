const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Image upload (chat, profile, townhall) ───────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'skillbridge/images', allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
});

// ─── Video upload (courses) ───────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'skillbridge/videos', allowed_formats: ['mp4', 'mov', 'avi', 'mkv'], resource_type: 'video' },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB

module.exports = { cloudinary, uploadImage, uploadVideo };