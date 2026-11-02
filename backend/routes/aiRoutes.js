// backend/routes/aiRoutes.js
import express from 'express';
import { enhanceClinicalNote } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/ai/enhance-note
// @desc    Enhance raw clinical notes using AI
// @access  Private (Requires valid JWT)
router.post('/enhance-note', protect, enhanceClinicalNote);

export default router;