import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getPatientDashboard,
  createHealthCheckReport,
  getHealthReports,
  getHealthReportById,
  downloadHealthReportPdf,
} from '../controllers/patientController.js';

const router = express.Router();

router.use(protect, restrictTo('PATIENT'));

router.route('/dashboard').get(getPatientDashboard);
router.route('/checkups').post(createHealthCheckReport).get(getHealthReports);
router.route('/checkups/:id').get(getHealthReportById);
router.route('/checkups/:id/pdf').get(downloadHealthReportPdf);

export default router;

