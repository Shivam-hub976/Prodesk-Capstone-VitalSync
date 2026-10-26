import { create } from 'zustand';
import { fetchAppointments, createAppointment, cancelAppointment } from '../services/appointmentService';

export const useAppointmentStore = create((set) => ({
  appointments: [],
  isLoading: false,
  error: null,

  // Fetch all appointments from backend
  loadAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAppointments();
      set({ appointments: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add new appointment and update state
  addAppointment: async (appointmentData) => {
    try {
      const newAppointment = await createAppointment(appointmentData);
      set((state) => ({
        appointments: [...state.appointments, newAppointment]
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cancel appointment with Optimistic UI update
  removeAppointment: async (id) => {
    // 1. Instantly remove from the UI state (Optimistic Update)
    set((state) => ({
      appointments: state.appointments.filter((app) => app._id !== id),
    }));

    // 2. Execute the background network request
    try {
      await cancelAppointment(id);
    } catch (error) {
      // 3. Rollback: If API fails, we should ideally fetch again to sync state,
      // but for MVP, we will log the error and force a reload if critical.
      console.error('Failed to delete on server, state might be out of sync', error);
      set({ error: error.message });
    }
  },
}));