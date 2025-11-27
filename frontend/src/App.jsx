import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import SuperAdminLoginPage from './pages/auth/SuperAdminLoginPage';
import PatientRegisterPage from './pages/auth/PatientRegisterPage';
import SuperDashboardPage from './pages/super/SuperDashboardPage';
import SuperHospitalsPage from './pages/super/SuperHospitalsPage';
import SuperPlansPage from './pages/super/SuperPlansPage';
import SuperAISettingsPage from './pages/super/SuperAISettingsPage';
import SuperAnalyticsPage from './pages/super/SuperAnalyticsPage';
import HospitalDashboardPage from './pages/hospital/HospitalDashboardPage';
import HospitalSettingsPage from './pages/hospital/HospitalSettingsPage';
import HospitalDoctorsPage from './pages/hospital/HospitalDoctorsPage';
import HospitalPatientsPage from './pages/hospital/HospitalPatientsPage';
import HospitalAnalyticsPage from './pages/hospital/HospitalAnalyticsPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientReportsPage from './pages/patient/PatientReportsPage';
import PatientReportDetailPage from './pages/patient/PatientReportDetailPage';
import PatientSettingsPage from './pages/patient/PatientSettingsPage';
import PatientNewCheckupPage from './pages/patient/PatientNewCheckupPage';
import NotFoundPage from './pages/misc/NotFoundPage';
import UnauthorizedPage from './pages/misc/UnauthorizedPage';
import LandingPage from './pages/misc/LandingPage';

import TermsAndConditionsPage from './pages/public/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/secret/super-admin" element={<SuperAdminLoginPage />} />
      <Route path="/auth/patient/register" element={<PatientRegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />

      <Route element={<ProtectedRoute requiredRole="SUPER_ADMIN" />}>
        <Route path="/super/dashboard" element={<SuperDashboardPage />} />
        <Route path="/super/hospitals" element={<SuperHospitalsPage />} />
        <Route path="/super/plans" element={<SuperPlansPage />} />
        <Route path="/super/ai-settings" element={<SuperAISettingsPage />} />
        <Route path="/super/analytics" element={<SuperAnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="HOSPITAL_ADMIN" requireSubdomain />}>
        <Route path="/hospital/dashboard" element={<HospitalDashboardPage />} />
        <Route path="/hospital/settings" element={<HospitalSettingsPage />} />
        <Route path="/hospital/doctors" element={<HospitalDoctorsPage />} />
        <Route path="/hospital/patients" element={<HospitalPatientsPage />} />
        <Route path="/hospital/analytics" element={<HospitalAnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="PATIENT" requireSubdomain />}>
        <Route path="/app/dashboard" element={<PatientDashboardPage />} />
        <Route path="/app/reports" element={<PatientReportsPage />} />
        <Route path="/app/reports/:id" element={<PatientReportDetailPage />} />
        <Route path="/app/checkup/new" element={<PatientNewCheckupPage />} />
        <Route path="/app/settings" element={<PatientSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
