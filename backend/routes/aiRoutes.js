import express from 'express';
import { enhanceClinicalNote } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// @route   POST /api/ai/enhance-note
// @desc    Enhance raw clinical notes using AI
// @access  Private (Requires valid JWT)
router.post('/enhance-note', protect, aiLimiter, enhanceClinicalNote);

export default router;