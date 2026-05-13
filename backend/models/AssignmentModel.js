import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fileUrl: String,
    submittedAt: Date,
    marks: Number,
    feedback: String,
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;