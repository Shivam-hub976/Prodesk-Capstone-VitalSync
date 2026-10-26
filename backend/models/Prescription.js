import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    record_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medication_name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage_instructions: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'dispensed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;