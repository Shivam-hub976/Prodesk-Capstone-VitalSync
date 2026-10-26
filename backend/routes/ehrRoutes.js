import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Tumhara auth middleware
import {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  createPrescription,
  getPrescriptionsByPatient,
} from '../controllers/ehrController.js';

const router = express.Router();

// Medical Records Routes
router.post('/medical-records', protect, createMedicalRecord);
router.get('/medical-records/patient/:patientId', protect, getMedicalRecordsByPatient);

// Prescriptions Routes
router.post('/prescriptions', protect, createPrescription);
router.get('/prescriptions/patient/:patientId', protect, getPrescriptionsByPatient);

export default router;