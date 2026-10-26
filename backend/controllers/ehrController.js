import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';

// @desc    Create a new clinical note/medical record
// @route   POST /api/medical-records
export const createMedicalRecord = async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      return res.status(403).json({ message: 'Patients cannot author medical records.' });
    }
    const { patient_id, diagnosis, clinical_notes, visit_date } = req.body;
    const doctor_id = req.user.role === 'admin' ? req.body.doctor_id : req.user._id;

    let record = await MedicalRecord.create({
      patient_id,
      doctor_id,
      diagnosis,
      clinical_notes,
      visit_date: visit_date || Date.now(),
    });

    // FIX: Save karte hi doctor ka naam populate karo taaki "Unknown" na dikhe
    record = await record.populate('doctor_id', 'name email');

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all medical records for a specific patient
// @route   GET /api/medical-records/patient/:patientId
// @access  Private
export const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // RBAC: Patient can only view their OWN records
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'You can only view your own medical records.' });
    }

    const records = await MedicalRecord.find({ patient_id: patientId })
      .populate('doctor_id', 'name email')
      .sort({ visit_date: -1 }); // Newest first

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue a new digital prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor, Admin)
export const createPrescription = async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      return res.status(403).json({ message: 'Patients cannot issue prescriptions.' });
    }

    const { patient_id, record_id, medication_name, dosage_instructions } = req.body;
    const doctor_id = req.user.role === 'admin' ? req.body.doctor_id : req.user._id;

    const prescription = await Prescription.create({
      record_id,
      patient_id,
      doctor_id,
      medication_name,
      dosage_instructions,
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active prescriptions for a patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'You can only view your own prescriptions.' });
    }

    const prescriptions = await Prescription.find({ patient_id: patientId })
      .populate('doctor_id', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};