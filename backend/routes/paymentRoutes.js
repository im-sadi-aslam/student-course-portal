import express from 'express';
import {
  createCoursePaymentIntent,
  createPremiumPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getAllPayments
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/create-course-payment', protect, createCoursePaymentIntent);
router.post('/create-premium-payment', protect, createPremiumPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);

// Admin only routes
router.get('/all', protect, authorize('admin'), getAllPayments);

export default router;