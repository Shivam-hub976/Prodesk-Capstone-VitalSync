// backend/middleware/rateLimitMiddleware.js
import rateLimit from 'express-rate-limit';

// Strict throttling for Authentication (Login/Register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { 
    success: false, 
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Protection for AI Billing Quota
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 AI requests per window
  message: { 
    success: false, 
    message: 'AI enhancement limit reached to prevent quota exhaustion. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});