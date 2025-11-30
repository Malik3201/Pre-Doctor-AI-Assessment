import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  ShieldAlert,
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/shared/EmptyState';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Label from '../../components/ui/Label';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
];

const statusBadgeMap = {
  active: 'success',
  suspended: 'warning',
  banned: 'danger',
};

const formatUsage = (used, max) => {
  if (!max) return `${used || 0} / —`;
  return `${used || 0} / ${max}`;
};

const initialCreateForm = {
  name: '',
  subdomain: '',
  logo: '',
  primaryColor: '#0f172a',
  secondaryColor: '#0ea5e9',
  planName: '',
  maxAiChecksPerMonth: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

export default function SuperHospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [plans, setPlans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ planId: '', maxOverride: '' });
  const [isPlanSubmitting, setIsPlanSubmitting] = useState(false);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const { showToast } = useToast();

  const fetchHospitals = useCallback(async (statusParam) => {
    const effectiveStatus = statusParam ?? statusFilter;
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (effectiveStatus !== 'all') {
        params.status = effectiveStatus;
      }
      const response = await apiClient.get('/super/hospitals', { params });
      setHospitals(response.data?.hospitals || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load hospitals right now.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await apiClient.get('/super/plans', { params: { isActive: true } });
      setPlans(response.data?.plans || []);
    } catch (err) {
      // silent fail to keep UI usable
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
    fetchPlans();
  }, [fetchHospitals, fetchPlans]);

  const filteredHospitals = useMemo(() => {
    if (!searchTerm) return hospitals;
    const query = searchTerm.toLowerCase();
    return hospitals.filter(
      (hospital) =>
        hospital.name?.toLowerCase().includes(query) ||
        hospital.subdomain?.toLowerCase().includes(query),
    );
  }, [hospitals, searchTerm]);

  const handleStatusFilterChange = (nextStatus) => {
    setStatusFilter(nextStatus);
    fetchHospitals(nextStatus);
  };

  const handleCreateFieldChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateHospital = async (event) => {
    event.preventDefault();
    setIsCreateSubmitting(true);
    setNotification(null);
    try {
      const payload = {
        name: createForm.name.trim(),
        subdomain: createForm.subdomain.trim(),
        logo: createForm.logo || undefined,
        primaryColor: createForm.primaryColor || undefined,
        secondaryColor: createForm.secondaryColor || undefined,
        planName: createForm.planName || undefined,
        maxAiChecksPerMonth:
          createForm.maxAiChecksPerMonth !== ''
            ? Number(createForm.maxAiChecksPerMonth)
            : undefined,
        admin: {
          name: createForm.adminName,
          email: createForm.adminEmail,
          password: createForm.adminPassword,
        },
      };

      await apiClient.post('/super/hospitals', payload);
      setNotification({ type: 'success', message: 'Hospital created successfully.' });
      showToast({
        title: 'Hospital created',
        description: `${payload.name} is ready.`,
        variant: 'success',
      });
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      fetchHospitals();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create hospital.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({
        title: 'Unable to create hospital',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleStatusUpdate = async (hospitalId, nextStatus) => {
    try {
      await apiClient.patch(`/super/hospitals/${hospitalId}/status`, { status: nextStatus });
      setNotification({ type: 'success', message: 'Status updated.' });
      showToast({ title: 'Status updated', variant: 'success' });
      fetchHospitals();
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update status.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({ title: 'Status update failed', description: message, variant: 'error' });
    }
  };

  const openPlanModal = (hospital) => {
    setSelectedHospital(hospital);
    setPlanForm({
      planId: plans.find((plan) => plan.name === hospital.planName)?._id || '',
      maxOverride: hospital.maxAiChecksPerMonth || '',
    });
    setIsPlanModalOpen(true);
  };

  const handleAssignPlan = async (event) => {
    event.preventDefault();
    if (!selectedHospital) return;
    setIsPlanSubmitting(true);
    setNotification(null);
    try {
      const payload = {
        planId: planForm.planId,
        maxAiChecksPerMonthOverride:
          planForm.maxOverride !== '' ? Number(planForm.maxOverride) : undefined,
      };
      await apiClient.patch(`/super/hospitals/${selectedHospital._id}/plan`, payload);
      setNotification({ type: 'success', message: 'Plan updated.' });
      showToast({ title: 'Plan assigned', variant: 'success' });
      setIsPlanModalOpen(false);
      setSelectedHospital(null);
      fetchHospitals();
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to assign plan.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({ title: 'Plan assignment failed', description: message, variant: 'error' });
    } finally {
      setIsPlanSubmitting(false);
    }
  };

  const openResetModal = (hospital) => {
    setSelectedHospital(hospital);
    setResetPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!selectedHospital) return;
    setIsResetSubmitting(true);
    setNotification(null);
    try {
      await apiClient.patch(`/super/hospitals/${selectedHospital._id}/reset-admin-password`, {
        newPassword: resetPassword,
      });
      setNotification({ type: 'success', message: 'Admin password reset successfully.' });
      showToast({ title: 'Admin password reset', variant: 'success' });
      setIsResetModalOpen(false);
      setSelectedHospital(null);
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to reset password.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({ title: 'Reset failed', description: message, variant: 'error' });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleViewHospital = async (hospitalId) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    setHospitalDetails(null);
    try {
      const response = await apiClient.get(`/super/hospitals/${hospitalId}`);
      setHospitalDetails(response.data?.hospital || null);
    } catch (err) {
      showToast({
        title: 'Unable to load hospital details',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'error',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const CREATE_FORM_ID = 'create-hospital-form';
  const PLAN_FORM_ID = 'assign-plan-form';
  const RESET_FORM_ID = 'reset-password-form';

  return (
    <SuperAdminLayout
      title="Hospitals Directory"
      subtitle="Create, audit, and manage all hospital tenants."
      actions={
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create hospital
        </Button>
      }
    >
      {notification?.message && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            notification.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {notification.message}
        </div>
      )}
      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="grid gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border border-slate-200 bg-white/90">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tenants loaded</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{hospitals.length}</p>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white/90">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {hospitals.filter((h) => h.status === 'active').length}
          </p>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white/90">
          <p className="text-xs uppercase tracking-wide text-slate-500">Suspended</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {hospitals.filter((h) => h.status === 'suspended').length}
          </p>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white/90">
          <p className="text-xs uppercase tracking-wide text-slate-500">Banned</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">
            {hospitals.filter((h) => h.status === 'banned').length}
          </p>
        </Card>
      </div>

      <Card className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Filter tenants</p>
            <p className="text-xs text-slate-500">Slice the directory by status or query.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={statusFilter}
                onChange={(event) => handleStatusFilterChange(event.target.value)}
                className="min-w-[160px]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            <Input
              placeholder="Search by name or subdomain"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full sm:w-72"
            />
            <Button variant="outline" onClick={() => fetchHospitals()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : filteredHospitals.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hospitals found"
          description="Adjust filters or create a new hospital to get started."
          className="bg-white"
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Hospital</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">AI usage</th>
                  <th className="px-6 py-4 font-medium">Patients</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital._id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{hospital.name}</p>
                      <p className="text-xs text-slate-500">{hospital.subdomain}.yourdomain.com</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeMap[hospital.status] || 'neutral'}>
                        {hospital.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{hospital.planName || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-slate-400" />
                        {formatUsage(hospital.aiChecksUsedThisMonth, hospital.maxAiChecksPerMonth)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{hospital.patientCount ?? 0}</p>
                        <p className="text-xs text-slate-500">
                          {hospital.activePatientCount ?? 0} active / {hospital.bannedPatientCount ?? 0} banned
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHospital(hospital._id)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Select
                          value={hospital.status}
                          onChange={(event) => handleStatusUpdate(hospital._id, event.target.value)}
                          className="w-32"
                        >
                          {['active', 'suspended', 'banned'].map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => openPlanModal(hospital)}>
                          <MoreHorizontal className="mr-2 h-4 w-4" />
                          Plan
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openResetModal(hospital)}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Card className="mt-6 rounded-3xl border border-amber-100 bg-amber-50/60 p-5 text-sm text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5" />
          <p>
            Compliance reminder: adjusting status immediately impacts patient access and AI usage for
            that tenant. Confirm with regional teams before banning hospitals.
          </p>
        </div>
      </Card>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create hospital"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={CREATE_FORM_ID} disabled={isCreateSubmitting}>
              {isCreateSubmitting ? 'Creating…' : 'Create hospital'}
            </Button>
          </>
        }
      >
        <form id={CREATE_FORM_ID} className="space-y-5" onSubmit={handleCreateHospital}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Hospital name</Label>
              <Input id="name" name="name" value={createForm.name} onChange={handleCreateFieldChange} required />
            </div>
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                name="subdomain"
                value={createForm.subdomain}
                onChange={handleCreateFieldChange}
                placeholder="alshifa"
                required
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" name="logo" value={createForm.logo} onChange={handleCreateFieldChange} />
            </div>
            <div>
              <Label htmlFor="planName">Plan</Label>
              <Select name="planName" value={createForm.planName} onChange={handleCreateFieldChange}>
                <option value="">No plan</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan.name}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="primaryColor">Primary color</Label>
              <Input
                id="primaryColor"
                name="primaryColor"
                type="color"
                value={createForm.primaryColor}
                onChange={handleCreateFieldChange}
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary color</Label>
              <Input
                id="secondaryColor"
                name="secondaryColor"
                type="color"
                value={createForm.secondaryColor}
                onChange={handleCreateFieldChange}
              />
            </div>
            <div>
              <Label htmlFor="maxAiChecksPerMonth">Max AI checks / month</Label>
              <Input
                id="maxAiChecksPerMonth"
                name="maxAiChecksPerMonth"
                type="number"
                min="1"
                value={createForm.maxAiChecksPerMonth}
                onChange={handleCreateFieldChange}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="mb-4 text-sm font-semibold text-slate-700">Initial administrator</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="adminName">Full name</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  value={createForm.adminName}
                  onChange={handleCreateFieldChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={createForm.adminEmail}
                  onChange={handleCreateFieldChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="adminPassword">Temporary password</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  value={createForm.adminPassword}
                  onChange={handleCreateFieldChange}
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={`Assign plan${selectedHospital ? ` • ${selectedHospital.name}` : ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={PLAN_FORM_ID} disabled={isPlanSubmitting}>
              {isPlanSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id={PLAN_FORM_ID} className="space-y-4" onSubmit={handleAssignPlan}>
          <div>
            <Label>Plan</Label>
            <Select
              value={planForm.planId}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, planId: event.target.value }))}
              required
            >
              <option value="">Select plan</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name} — {plan.maxAiChecksPerMonth} checks
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Override monthly limit (optional)</Label>
            <Input
              type="number"
              min="1"
              value={planForm.maxOverride}
              onChange={(event) =>
                setPlanForm((prev) => ({ ...prev, maxOverride: event.target.value }))
              }
              placeholder="Leave blank to use plan default"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset admin password${selectedHospital ? ` • ${selectedHospital.name}` : ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={RESET_FORM_ID} disabled={isResetSubmitting} variant="danger">
              {isResetSubmitting ? 'Resetting…' : 'Reset password'}
            </Button>
          </>
        }
      >
        <form id={RESET_FORM_ID} className="space-y-4" onSubmit={handleResetPassword}>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              minLength={6}
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              Password must be at least 6 characters. Share the new credentials securely with the
              hospital admin.
            </p>
          </div>
        </form>
      </Modal>

      {/* Hospital Detail Modal */}
      <Modal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Hospital Details"
        footer={
          <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>
        }
      >
        {isDetailLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner className="h-8 w-8 border-slate-300" />
          </div>
        ) : hospitalDetails ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{hospitalDetails.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Subdomain</p>
                <p className="mt-1 text-sm text-slate-700">{hospitalDetails.subdomain}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-1">
                  <Badge variant={statusBadgeMap[hospitalDetails.status] || 'neutral'}>
                    {hospitalDetails.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Plan</p>
                <p className="mt-1 text-sm text-slate-700">{hospitalDetails.planName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</p>
                <p className="mt-1 text-sm text-slate-700">
                  {hospitalDetails.createdAt
                    ? new Date(hospitalDetails.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Updated</p>
                <p className="mt-1 text-sm text-slate-700">
                  {hospitalDetails.updatedAt
                    ? new Date(hospitalDetails.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* AI Usage Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-slate-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    AI Checks Usage
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatUsage(
                      hospitalDetails.aiChecksUsedThisMonth,
                      hospitalDetails.maxAiChecksPerMonth,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">This month</p>
                </div>
              </div>
            </div>

            {/* Branding Info */}
            {(hospitalDetails.logo || hospitalDetails.primaryColor || hospitalDetails.secondaryColor) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Branding</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {hospitalDetails.logo && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Logo URL</p>
                      <p className="mt-1 break-all text-sm text-slate-700">{hospitalDetails.logo}</p>
                    </div>
                  )}
                  {hospitalDetails.primaryColor && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Primary Color
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded border border-slate-200"
                          style={{ backgroundColor: hospitalDetails.primaryColor }}
                        />
                        <p className="text-sm text-slate-700">{hospitalDetails.primaryColor}</p>
                      </div>
                    </div>
                  )}
                  {hospitalDetails.secondaryColor && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Secondary Color
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded border border-slate-200"
                          style={{ backgroundColor: hospitalDetails.secondaryColor }}
                        />
                        <p className="text-sm text-slate-700">{hospitalDetails.secondaryColor}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Info */}
            {hospitalDetails.settings && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Settings</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {hospitalDetails.settings.tagline && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tagline</p>
                      <p className="mt-1 text-sm text-slate-700">{hospitalDetails.settings.tagline}</p>
                    </div>
                  )}
                  {hospitalDetails.settings.city && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">City</p>
                      <p className="mt-1 text-sm text-slate-700">{hospitalDetails.settings.city}</p>
                    </div>
                  )}
                  {hospitalDetails.settings.country && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Country</p>
                      <p className="mt-1 text-sm text-slate-700">{hospitalDetails.settings.country}</p>
                    </div>
                  )}
                  {hospitalDetails.settings.assistantName && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Assistant Name
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {hospitalDetails.settings.assistantName}
                      </p>
                    </div>
                  )}
                  {hospitalDetails.settings.assistantTone && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Assistant Tone
                      </p>
                      <p className="mt-1 text-sm capitalize text-slate-700">
                        {hospitalDetails.settings.assistantTone}
                      </p>
                    </div>
                  )}
                  {hospitalDetails.settings.assistantLanguage && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Assistant Language
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {hospitalDetails.settings.assistantLanguage}
                      </p>
                    </div>
                  )}
                </div>
                {hospitalDetails.settings.enabledFeatures && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Enabled Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hospitalDetails.settings.enabledFeatures.dietPlan && (
                        <Badge variant="success">Diet Plan</Badge>
                      )}
                      {hospitalDetails.settings.enabledFeatures.testSuggestions && (
                        <Badge variant="success">Test Suggestions</Badge>
                      )}
                      {hospitalDetails.settings.enabledFeatures.doctorRecommendation && (
                        <Badge variant="success">Doctor Recommendation</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500">No hospital data available</p>
        )}
      </Modal>
    </SuperAdminLayout>
  );
}
