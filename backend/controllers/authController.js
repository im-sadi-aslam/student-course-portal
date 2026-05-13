import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Register attempt:', { name, email });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        premiumStatus: user.premiumStatus || false,
        enrolledCourses: user.enrolledCourses || [],
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        premiumStatus: user.premiumStatus || false,
        enrolledCourses: user.enrolledCourses || [],
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    console.log('GetMe called for user:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('enrolledCourses', 'title instructorName thumbnail duration');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        premiumStatus: user.premiumStatus || false,
        enrolledCourses: user.enrolledCourses || [],
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};