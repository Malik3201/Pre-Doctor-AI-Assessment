import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Edit3, Layers, PlusCircle, ShieldOff } from 'lucide-react';
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

const filterOptions = [
  { label: 'All plans', value: 'all' },
  { label: 'Active only', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const initialFormState = {
  name: '',
  description: '',
  priceMonthly: '',
  maxAiChecksPerMonth: '',
  isActive: true,
};

export default function SuperPlansPage() {
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formState, setFormState] = useState(initialFormState);
  const [activePlan, setActivePlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PLAN_FORM_ID = 'plan-form';

  const fetchPlans = useCallback(async (statusParam) => {
    const effectiveStatus = statusParam ?? filter;
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (effectiveStatus === 'active') params.isActive = true;
      if (effectiveStatus === 'inactive') params.isActive = false;
      const response = await apiClient.get('/super/plans', { params });
      setPlans(response.data?.plans || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load plans.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filteredPlans = useMemo(() => {
    if (!searchTerm) return plans;
    const query = searchTerm.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.name?.toLowerCase().includes(query) ||
        plan.description?.toLowerCase().includes(query),
    );
  }, [plans, searchTerm]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormState(initialFormState);
    setActivePlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setModalMode('edit');
    setActivePlan(plan);
    setFormState({
      name: plan.name || '',
      description: plan.description || '',
      priceMonthly: plan.priceMonthly ?? '',
      maxAiChecksPerMonth: plan.maxAiChecksPerMonth ?? '',
      isActive: plan.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmitPlan = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const payload = {
      name: formState.name.trim(),
      description: formState.description,
      priceMonthly: Number(formState.priceMonthly) || 0,
      maxAiChecksPerMonth: Number(formState.maxAiChecksPerMonth),
      isActive: formState.isActive,
    };

    if (!payload.name || !payload.maxAiChecksPerMonth || payload.maxAiChecksPerMonth <= 0) {
      setNotification({ type: 'error', message: 'Please provide a valid name and limit.' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (modalMode === 'create') {
        await apiClient.post('/super/plans', payload);
        setNotification({ type: 'success', message: 'Plan created successfully.' });
      } else if (activePlan) {
        await apiClient.put(`/super/plans/${activePlan._id}`, payload);
        setNotification({ type: 'success', message: 'Plan updated.' });
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to save plan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (plan) => {
    setNotification(null);
    try {
      if (plan.isActive) {
        await apiClient.delete(`/super/plans/${plan._id}`);
        setNotification({ type: 'success', message: 'Plan deactivated.' });
      } else {
        await apiClient.put(`/super/plans/${plan._id}`, { isActive: true });
        setNotification({ type: 'success', message: 'Plan reactivated.' });
      }
      fetchPlans();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to update plan status.',
      });
    }
  };

  return (
    <SuperAdminLayout
      title="Subscription Plans"
      subtitle="Define plan tiers, AI limits, and billing metadata."
      actions={
        <Button onClick={openCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Plan
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
            <h3 className="text-lg font-semibold text-slate-900">Plan catalog</h3>
            <p className="text-sm text-slate-500">Manage pricing and AI quotas across tiers.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                fetchPlans(event.target.value);
              }}
              className="min-w-[150px]"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Search by name or description"
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
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No plans available"
          description="Create a plan to define AI usage and billing options."
          className="bg-white"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card key={plan._id} className="flex h-full flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
                      <p className="text-sm text-slate-500">{plan.description || 'No description'}</p>
                    </div>
                  </div>
                  <Badge variant={plan.isActive ? 'success' : 'warning'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Monthly price</p>
                    <p className="text-lg font-semibold text-slate-900">
                      ${Number(plan.priceMonthly || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">AI checks</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {plan.maxAiChecksPerMonth?.toLocaleString() || '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={() => openEditModal(plan)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeactivate(plan)}
                  className="text-slate-600"
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create plan' : `Edit ${activePlan?.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={PLAN_FORM_ID} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save plan'}
            </Button>
          </>
        }
      >
        <form id={PLAN_FORM_ID} className="space-y-4" onSubmit={handleSubmitPlan}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="plan-price">Monthly price (USD)</Label>
              <Input
                id="plan-price"
                name="priceMonthly"
                type="number"
                min="0"
                step="0.01"
                value={formState.priceMonthly}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="plan-description">Description</Label>
            <textarea
              id="plan-description"
              name="description"
              value={formState.description}
              onChange={handleFormChange}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="plan-max">Max AI checks / month</Label>
              <Input
                id="plan-max"
                name="maxAiChecksPerMonth"
                type="number"
                min="1"
                value={formState.maxAiChecksPerMonth}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Active
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </SuperAdminLayout>
  );
}
