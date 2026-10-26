import express from 'express';
import {
  createAppointment,
  getAppointments,
  deleteAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Chain routing for clean architecture
router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .delete(deleteAppointment);

// New endpoint for Doctors/Admins to Accept, Reject, or Reschedule 
router.route('/:id/status')
  .patch(updateAppointmentStatus);

export default router;