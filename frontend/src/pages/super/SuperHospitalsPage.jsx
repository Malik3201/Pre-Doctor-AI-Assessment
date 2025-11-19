import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CheckCircle2,
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
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      fetchHospitals();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to create hospital.',
      });
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleStatusUpdate = async (hospitalId, nextStatus) => {
    try {
      await apiClient.patch(`/super/hospitals/${hospitalId}/status`, { status: nextStatus });
      setNotification({ type: 'success', message: 'Status updated.' });
      fetchHospitals();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to update status.',
      });
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
      setIsPlanModalOpen(false);
      setSelectedHospital(null);
      fetchHospitals();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to assign plan.',
      });
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
      setIsResetModalOpen(false);
      setSelectedHospital(null);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to reset password.',
      });
    } finally {
      setIsResetSubmitting(false);
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
          Create Hospital
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

      <Card className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Hospitals</h3>
            <p className="text-sm text-slate-500">
              {hospitals.length} tenant{hospitals.length === 1 ? '' : 's'} loaded
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
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
              <Button variant="ghost" onClick={() => fetchHospitals()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <Input
              placeholder="Search by name or subdomain..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full sm:w-72"
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
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
        <Card className="overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Subdomain</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">AI Usage</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{hospital.name}</p>
                      <p className="text-xs text-slate-500">ID: {hospital._id.slice(-6)}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{hospital.subdomain}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeMap[hospital.status] || 'neutral'}>
                        {hospital.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{hospital.planName || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-slate-400" />
                        {formatUsage(hospital.aiChecksUsedThisMonth, hospital.maxAiChecksPerMonth)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
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
                        <Button variant="ghost" size="sm" onClick={() => openResetModal(hospital)}>
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Reset admin
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create hospital modal */}
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
        <form id={CREATE_FORM_ID} className="space-y-4" onSubmit={handleCreateHospital}>
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
          <div className="rounded-2xl border border-slate-200 p-4">
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

      {/* Assign plan modal */}
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

      {/* Reset password modal */}
      <Modal
        open={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset admin password${selectedHospital ? ` • ${selectedHospital.name}` : ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={RESET_FORM_ID} disabled={isResetSubmitting}>
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
    </SuperAdminLayout>
  );
}
