import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getStats
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/stats', getStats);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;