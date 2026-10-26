import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ehrRoutes from './routes/ehrRoutes.js';

// Force Node to use Google DNS for SRV lookups (bypasses ISP blocking)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables
dotenv.config();

const app = express();

// Core Middlewares
const allowedOrigins = [
  'http://localhost:5173', // Local Vite development
  'http://localhost:3000', // Alternative local port
  process.env.FRONTEND_URL // Vercel Production URL (we will set this on Render)
].filter(Boolean); // Filters out undefined if FRONTEND_URL is not set yet

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or Thunder Client)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS Policy Error: Origin ${origin} is not authorized to access this API.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); // Protected endpoint test route
app.use('/api/appointments', appointmentRoutes); // Protected endpoint for appointments
app.use('/api/payments', paymentRoutes); // Protected endpoint for payments
app.use('/api/ehr', ehrRoutes); // Protected endpoint for EHR operations

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VitalSync API is online' });
});

// Database Connection & Server Initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });