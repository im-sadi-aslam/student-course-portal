import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  amount: {
    type: Number,
    required: true
  },
  stripePaymentId: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentType: {
    type: String,
    enum: ['course', 'premium'],
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mock'],
    default: 'card'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster user queries
paymentSchema.index({ user: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;