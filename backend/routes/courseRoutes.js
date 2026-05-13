import express from 'express';
import {
  getCourses,
  getCourse,
  enrollCourse,
  createCourse
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, authorize('teacher', 'admin'), createCourse);

router.get('/:id', getCourse);
router.post('/:id/enroll', protect, enrollCourse);

export default router;