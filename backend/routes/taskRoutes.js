import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user tasks / clinical data (Protected Endpoint)
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // req.user is safely attached by the protect middleware after verifying the JWT
    res.status(200).json({
      success: true,
      message: `Access granted to protected pipeline for user: ${req.user.name}`,
      userRole: req.user.role,
      tasks: [
        { id: 1, title: 'Review Patient Medical History', status: 'Pending' },
        { id: 2, title: 'Authorize Digital Prescription', status: 'Completed' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;