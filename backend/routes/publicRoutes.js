import express from 'express';
import { getHospitalMeta } from '../controllers/publicController.js';

const router = express.Router();

router.get('/hospital-meta', getHospitalMeta);

export default router;

