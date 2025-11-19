import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { aiHealthCheck } from '../controllers/aiController.js';
import { validateBody } from '../middleware/validate.js';
import { healthCheckSchema } from '../validation/aiSchemas.js';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Too many AI requests, please slow down.' },
});

router.use(protect, restrictTo('PATIENT'));

router.post('/health-check', aiLimiter, validateBody(healthCheckSchema), aiHealthCheck);

export default router;

