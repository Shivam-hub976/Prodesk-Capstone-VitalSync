// backend/validators/schemas.js
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, "Password must be at least 8 chars and contain uppercase, lowercase, number, and special character."),
  role: z.enum(['patient', 'doctor', 'admin']).optional(),
  secretKey: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const appointmentSchema = z.object({
  doctor_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
  schedule_date: z.string().datetime("Must be a valid ISO 8601 UTC date string"),
  reason_for_visit: z.string().min(3, "Reason for visit must be at least 3 characters").trim(),
  patient_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Patient ID format").optional().or(z.literal(''))
});