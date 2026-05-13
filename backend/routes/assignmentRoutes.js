import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();

// GET all assignments
router.get('/', protect, getAssignments);

// GET single assignment
router.get('/:id', protect, getAssignmentById);

// POST create assignment (teacher only)
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);

// POST submit assignment (student only)
router.post('/:id/submit', protect, upload.single('file'), submitAssignment);

// PUT grade assignment (teacher only)
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeAssignment);

// DELETE assignment (teacher only)
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

export default router;