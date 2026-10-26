import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
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
    schedule_date: {
      type: Date,
      required: true,
    },
    reason_for_visit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      // CRITICAL FIX: Added all valid workflow states to avoid validation errors
      enum: ['pending', 'scheduled', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;