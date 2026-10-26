import express from 'express';
import { createCheckoutSession, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify', protect, verifyPayment); // New verification endpoint

export default router;