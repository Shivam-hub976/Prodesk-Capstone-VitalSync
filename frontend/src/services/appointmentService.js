// Dynamic API URL for Local Dev & Production Deployment
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Remove '/auth' if it was accidentally included in the environment variable (from MVP Sprint 14)
if (baseUrl.endsWith('/auth')) {
  baseUrl = baseUrl.replace('/auth', '');
}

const API_URL = `${baseUrl}/appointments`;

// Helper function to dynamically grab the latest token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchAppointments = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch appointments');
  return data;
};

export const createAppointment = async (appointmentData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to book appointment');
  return data;
};

export const cancelAppointment = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to cancel appointment');
  return data; // Returns the deleted ID for our Optimistic UI update
};