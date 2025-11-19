import express from 'express';
import { login, registerPatient, bootstrapSuperAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/patient/register', registerPatient);
router.post('/super-admin/bootstrap', bootstrapSuperAdmin);

export default router;

