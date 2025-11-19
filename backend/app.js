import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import hospitalAdminRoutes from './routes/hospitalAdminRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { tenantResolver } from './middleware/tenantMiddleware.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';


const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());

// Tenant context middleware
app.use(tenantResolver);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/super', superAdminRoutes);
app.use('/api/hospital', hospitalAdminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;

