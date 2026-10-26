// Dynamic API URL for Local Dev & Production Deployment
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Strip '/auth' if it exists in the environment variable
if (baseUrl.endsWith('/auth')) {
  baseUrl = baseUrl.replace('/auth', '');
}
const API_URL = `${baseUrl}/payments`;

export const triggerStripeCheckout = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to initialize payment gateway');
  
  return data.url; 
};