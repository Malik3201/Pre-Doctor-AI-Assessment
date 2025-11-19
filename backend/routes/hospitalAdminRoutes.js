import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getHospitalSettings,
  updateHospitalSettings,
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getPatients,
  togglePatientBanStatus,
  getHospitalAnalyticsOverview,
} from '../controllers/hospitalAdminController.js';

const router = express.Router();

router.use(protect, restrictTo('HOSPITAL_ADMIN'));

router.route('/settings').get(getHospitalSettings).put(updateHospitalSettings);

router.route('/doctors').post(createDoctor).get(getDoctors);
router.route('/doctors/:id').get(getDoctorById).put(updateDoctor).delete(deleteDoctor);

router.route('/patients').get(getPatients);
router.route('/patients/:id/ban').patch(togglePatientBanStatus);

router.route('/analytics/overview').get(getHospitalAnalyticsOverview);

export default router;

