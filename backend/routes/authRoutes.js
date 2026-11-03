import express from 'express';
import { registerUser, loginUser, getUserProfile, getDoctors, getPatients, updateUserProfile, updateUserProfileByAdmin, deleteUserByAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Update the Public Routes to include the validate middleware
router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);

// Protected Routes (Passed through protect middleware first)
router.get('/me', protect, getUserProfile);
router.get('/doctors', protect, getDoctors); // New endpoint for the dropdown
router.get('/patients', protect, getPatients);
router.put('/profile', protect, updateUserProfile);
router.put('/users/:id', protect, updateUserProfileByAdmin);
router.delete('/users/:id', protect, deleteUserByAdmin);
export default router;