import express from 'express';
import { registerUser, loginUser, getUserProfile, getDoctors, getPatients, updateUserProfile, updateUserProfileByAdmin, deleteUserByAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes (Passed through protect middleware first)
router.get('/me', protect, getUserProfile);
router.get('/doctors', protect, getDoctors); // New endpoint for the dropdown
router.get('/patients', protect, getPatients);
router.put('/profile', protect, updateUserProfile);
router.put('/users/:id', protect, updateUserProfileByAdmin);
router.delete('/users/:id', protect, deleteUserByAdmin);
export default router;