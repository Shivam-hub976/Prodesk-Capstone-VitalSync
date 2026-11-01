import Appointment from '../models/Appointment.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { doctor_id, schedule_date, reason_for_visit, patient_id } = req.body;

    // Block past dates on the backend
    if (new Date(schedule_date) < new Date()) {
      return res.status(400).json({ message: 'Cannot book appointments in the past.' });
    }

    // Admin can book for any patient, or select 'Self'
    let actualPatientId = req.user._id;
    if (req.user.role === 'admin' && patient_id) {
      actualPatientId = patient_id;
    }

    let appointment = await Appointment.create({
      patient_id: actualPatientId, 
      doctor_id,
      schedule_date,
      reason_for_visit,
      status: 'pending' 
    });

    appointment = await appointment.populate('doctor_id', 'name email');
    appointment = await appointment.populate('patient_id', 'name email');

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments for the logged-in user
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient_id = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor_id = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor_id', 'name email')
      .populate('patient_id', 'name email')
      .sort({ schedule_date: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status or details (date/reason)
// @route   PATCH /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 1. Strict Ownership & Role Validation (IDOR Protection)
    const isOwnerPatient = req.user.role === 'patient' && appointment.patient_id.toString() === req.user._id.toString();
    const isAssignedDoctor = req.user.role === 'doctor' && appointment.doctor_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access to this record' });
    }

    // 2. Prevent Patients from bypassing doctor workflows (changing status)
    if (req.user.role === 'patient' && req.body.status) {
      return res.status(403).json({ message: 'Forbidden: Patients cannot mutate appointment status' });
    }

    // 3. Prevent Patients from editing already approved/completed appointments
    if (req.user.role === 'patient' && appointment.status !== 'pending') {
      return res.status(403).json({ message: 'Forbidden: Cannot edit an appointment that is already processed' });
    }

    // Apply safe updates
    if (req.body.status && req.user.role !== 'patient') {
      appointment.status = req.body.status;
    }
    
    if (req.body.schedule_date) appointment.schedule_date = req.body.schedule_date;
    if (req.body.reason_for_visit) appointment.reason_for_visit = req.body.reason_for_visit;

    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Cancel an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (
      appointment.patient_id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' 
    ) {
      return res.status(403).json({ message: 'Forbidden: You do not have authorization to modify this record' });
    }

    await appointment.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};