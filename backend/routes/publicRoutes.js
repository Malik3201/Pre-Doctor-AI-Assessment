import express from 'express';
import {
  getHospitalMeta,
  getHospitalPublicSite,
  getPublicHighlightDoctors,
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/hospital-meta', getHospitalMeta);
router.get('/hospital-site', getHospitalPublicSite);
router.get('/hospital-doctors', getPublicHighlightDoctors);

export default router;

