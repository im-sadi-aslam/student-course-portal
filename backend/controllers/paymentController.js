import Stripe from 'stripe';
import Payment from '../models/PaymentModel.js';
import User from '../models/UserModel.js';
import Course from '../models/CourseModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Stripe initialize with better error handling
let stripe = null;
let stripeInitialized = false;

try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing in .env file');
    console.warn('💡 Payment features will work in DEMO mode');
  } else if (stripeSecretKey === 'your_stripe_secret_key') {
    console.warn('⚠️ Using placeholder STRIPE_SECRET_KEY. Please update with real key.');
    console.warn('💡 Payment features will work in DEMO mode');
  } else if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
    console.warn('⚠️ Invalid STRIPE_SECRET_KEY format');
    console.warn('💡 Payment features will work in DEMO mode');
  } else {
    // Valid key found, initialize Stripe
    stripe = new Stripe(stripeSecretKey);
    stripeInitialized = true;
    console.log('✅ Stripe initialized successfully in', stripeSecretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE', 'mode');
  }
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
  console.warn('💡 Continuing in DEMO mode without Stripe');
}

// Helper function to generate mock payment ID
const generateMockId = () => `mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

// @desc    Create payment intent for course
export const createCoursePaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If Stripe is not initialized, return mock payment intent
    if (!stripeInitialized) {
      const mockClientSecret = generateMockId();
      console.log('🔧 [DEMO] Creating mock payment intent for course:', course.title);
      
      return res.status(200).json({
        success: true,
        clientSecret: mockClientSecret,
        demoMode: true,
        message: 'Demo mode: No actual payment will be processed'
      });
    }

    // Real Stripe payment intent
    const amountInCents = Math.round(course.price * 100);
    
    if (amountInCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount for payment'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        courseId: course._id.toString(),
        userId: req.user.id,
        type: 'course',
        courseTitle: course.title
      },
      description: `Enrollment for ${course.title}`,
      statement_descriptor: 'Course Enrollment'
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      demoMode: false
    });
  } catch (error) {
    console.error('❌ Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
};

// @desc    Create payment intent for premium subscription
export const createPremiumPaymentIntent = async (req, res) => {
  try {
    // If Stripe is not initialized, return mock payment intent
    if (!stripeInitialized) {
      const mockClientSecret = generateMockId();
      console.log('🔧 [DEMO] Creating mock payment intent for premium subscription');
      
      return res.status(200).json({
        success: true,
        clientSecret: mockClientSecret,
        demoMode: true,
        message: 'Demo mode: No actual payment will be processed'
      });
    }

    // Real Stripe payment intent for premium
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9999, // $99.99
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        type: 'premium',
        userEmail: req.user.email
      },
      description: 'Premium Subscription - Lifetime Access',
      statement_descriptor: 'Premium Subscription'
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      demoMode: false
    });
  } catch (error) {
    console.error('❌ Premium payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create premium payment'
    });
  }
};

// @desc    Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, amount, paymentType, courseId, demoMode } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    let isMockPayment = demoMode || paymentIntentId.startsWith('mock_');
    let finalAmount = amount;
    let finalPaymentType = paymentType;
    let finalCourseId = courseId;
    let paymentStatus = 'success';

    // For real Stripe payments, verify with Stripe
    if (!isMockPayment && stripeInitialized) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({
            success: false,
            message: `Payment not successful. Status: ${paymentIntent.status}`
          });
        }
        
        finalAmount = paymentIntent.amount / 100;
        finalPaymentType = paymentIntent.metadata.type;
        finalCourseId = paymentIntent.metadata.courseId;
        paymentStatus = 'success';
        
      } catch (stripeError) {
        console.error('❌ Stripe verification error:', stripeError);
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    }

    // Create payment record in database
    const payment = await Payment.create({
      user: req.user.id,
      course: finalPaymentType === 'course' ? finalCourseId : null,
      amount: finalAmount || (finalPaymentType === 'premium' ? 99.99 : 0),
      stripePaymentId: paymentIntentId,
      paymentStatus: paymentStatus,
      paymentType: finalPaymentType || 'premium',
      paymentMethod: isMockPayment ? 'mock' : 'card',
      metadata: {
        demoMode: isMockPayment,
        confirmedAt: new Date().toISOString(),
        userEmail: req.user.email
      }
    });

    // Handle premium subscription upgrade
    if (finalPaymentType === 'premium') {
      await User.findByIdAndUpdate(req.user.id, {
        premiumStatus: true
      });
      console.log(`✨ User ${req.user.email} upgraded to PREMIUM`);
    }

    // Handle course enrollment
    if (finalPaymentType === 'course' && finalCourseId) {
      const user = await User.findById(req.user.id);
      const course = await Course.findById(finalCourseId);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if already enrolled
      if (!user.enrolledCourses.includes(course._id)) {
        user.enrolledCourses.push(course._id);
        course.enrolledStudents.push(user._id);
        await user.save();
        await course.save();
        console.log(`📚 User ${user.email} enrolled in course: ${course.title}`);
      }
    }

    res.status(200).json({
      success: true,
      message: isMockPayment ? '✅ Demo payment successful! (No actual charge)' : '✅ Payment confirmed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        type: payment.paymentType,
        status: payment.paymentStatus,
        date: payment.createdAt
      },
      demoMode: isMockPayment
    });
  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment'
    });
  }
};

// @desc    Get payment history for logged-in user
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title thumbnail duration')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all payments (Admin only)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};