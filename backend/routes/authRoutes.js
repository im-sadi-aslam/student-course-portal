import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/UserModel.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Profile routes
router.post('/upload-profile', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pictures',
      width: 300,
      height: 300,
      crop: 'fill'
    });

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { profilePicture: result.secure_url },
      { new: true }
    );

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      imageUrl: result.secure_url,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload image' 
    });
  }
});

router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, bio, phone } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update profile' 
    });
  }
});

export default router;