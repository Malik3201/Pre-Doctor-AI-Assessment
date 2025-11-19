import express from 'express';
import {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospitalStatus,
  resetHospitalAdminPassword,
  getGlobalStats,
  getAiSettings,
  updateAiSettings,
  createSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  assignHospitalPlan,
} from '../controllers/superAdminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('SUPER_ADMIN'));

router.route('/hospitals').post(createHospital).get(getHospitals);
router.route('/hospitals/:id').get(getHospitalById);
router.route('/hospitals/:id/status').patch(updateHospitalStatus);
router.route('/hospitals/:id/reset-admin-password').patch(resetHospitalAdminPassword);
router.route('/hospitals/:id/plan').patch(assignHospitalPlan);
router.route('/analytics/overview').get(getGlobalStats);
router.route('/settings/ai').get(getAiSettings).put(updateAiSettings);
router.route('/plans').post(createSubscriptionPlan).get(getSubscriptionPlans);
router.route('/plans/:id').put(updateSubscriptionPlan).delete(deleteSubscriptionPlan);

export default router;

