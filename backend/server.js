import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import cron from 'node-cron';
import Appointment from './models/Appointment.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ehrRoutes from './routes/ehrRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Force Node to use Google DNS for SRV lookups (bypasses ISP blocking)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables
dotenv.config();

const app = express();
// Trust Render's reverse proxy (Fixes the express-rate-limit X-Forwarded-For error)
app.set('trust proxy', 1);

// Core Middlewares - PRODUCTION HARDENING
const allowedOrigins = [
  process.env.FRONTEND_URL // Strictly accepts ONLY the live Vercel URL
]; 

app.use(cors({
  origin: function (origin, callback) {
    // Allows backend-to-backend tools like Thunder Client/Postman, but strictly filters browser traffic
    if (!origin) return callback(null, true); 
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS Policy Error: Origin ${origin} is strictly prohibited by production security policies.`;
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
app.use('/api/ai', aiRoutes); // Protected endpoint for AI operations

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VitalSync API is online' });
});

// Initialize Background Worker (Runs every 15 minutes)
cron.schedule('*/15 * * * *', async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await Appointment.updateMany(
      { 
        schedule_date: { $lt: oneHourAgo }, 
        status: 'pending' 
      },
      { $set: { status: 'cancelled' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Cron] Auto-cancelled ${result.modifiedCount} expired pending appointments.`);
    }
  } catch (error) {
    console.error('[Cron] Failed to execute appointment cleanup:', error.message);
  }
});

// Mount the error handlers HERE (Must be after all other routes)
app.use(notFound);
app.use(errorHandler);

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