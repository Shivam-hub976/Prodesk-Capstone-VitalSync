import { create } from 'zustand';

export const useRecordStore = create((set, get) => ({
  activePatientHistory: [],
  activePrescriptions: [],
  isLoading: false,
  error: null,

  // Fetch both records and prescriptions concurrently
  fetchPatientEHR: async (patientId) => {
    if (!patientId) return;
    
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      if (baseUrl.endsWith('/auth')) baseUrl = baseUrl.replace('/auth', '');

      // Fetch both records and prescriptions concurrently
      const [recordsRes, prescriptionsRes] = await Promise.all([
        fetch(`${baseUrl}/ehr/medical-records/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/ehr/prescriptions/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!recordsRes.ok || !prescriptionsRes.ok) {
        throw new Error('Failed to fetch patient EHR data');
      }

      const records = await recordsRes.json();
      const prescriptions = await prescriptionsRes.json();

      set({
        activePatientHistory: Array.isArray(records) ? records : [],
        activePrescriptions: Array.isArray(prescriptions) ? prescriptions : [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add new clinical note (Doctor/Admin only)
  addClinicalEntry: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      if (baseUrl.endsWith('/auth')) baseUrl = baseUrl.replace('/auth', '');

      const response = await fetch(`${baseUrl}/ehr/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add clinical note');

      // Update state locally so UI reflects change instantly without reload
      set((state) => ({
        activePatientHistory: [data, ...state.activePatientHistory],
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Add new prescription (Doctor/Admin only)
  addPrescription: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      if (baseUrl.endsWith('/auth')) baseUrl = baseUrl.replace('/auth', '');

      const response = await fetch(`${baseUrl}/ehr/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add prescription');

      set((state) => ({
        activePrescriptions: [data, ...state.activePrescriptions],
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },
}));