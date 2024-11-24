import rateLimiter from "express-rate-limit"

export const loginLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: {
    status: 429,
    message: "Too many login attempts. Please try again after 10 minutes.",
  },
});