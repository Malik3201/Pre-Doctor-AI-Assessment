import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, ShieldAlert, Stethoscope, Trash2, UserPlus } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/shared/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Label from '../../components/ui/Label';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/apiClient';

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const initialFormState = {
  name: '',
  specialization: '',
  experienceYears: '',
  expertiseTags: '',
  timings: '',
  description: '',
  status: 'active',
};

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formState, setFormState] = useState(initialFormState);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const DOCTOR_FORM_ID = 'doctor-form';

  const fetchDoctors = useCallback(
    async (statusParam) => {
      const effectiveStatus = statusParam ?? statusFilter;
      setIsLoading(true);
      setError('');
      try {
        const params = { limit: 100 };
        if (effectiveStatus !== 'all') {
          params.status = effectiveStatus;
        }
        const response = await apiClient.get('/hospital/doctors', { params });
        setDoctors(response.data?.doctors || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load doctors.');
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const filteredDoctors = useMemo(() => {
    if (!searchTerm) return doctors;
    const query = searchTerm.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(query) ||
        doctor.specialization?.toLowerCase().includes(query),
    );
  }, [doctors, searchTerm]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormState(initialFormState);
    setActiveDoctor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setModalMode('edit');
    setActiveDoctor(doctor);
    setFormState({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      experienceYears: doctor.experienceYears ?? '',
      expertiseTags: (doctor.expertiseTags || []).join(', '),
      timings: doctor.timings || '',
      description: doctor.description || '',
      status: doctor.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const payload = {
      ...formState,
      experienceYears:
        formState.experienceYears !== '' ? Number(formState.experienceYears) : undefined,
      expertiseTags: formState.expertiseTags
        ? formState.expertiseTags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined,
    };

    try {
      if (modalMode === 'create') {
        await apiClient.post('/hospital/doctors', payload);
        setNotification({ type: 'success', message: 'Doctor added successfully.' });
      } else if (activeDoctor) {
        await apiClient.put(`/hospital/doctors/${activeDoctor._id}`, payload);
        setNotification({ type: 'success', message: 'Doctor updated.' });
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to save doctor.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Remove Dr. ${doctor.name}?`)) return;
    setNotification(null);
    try {
      await apiClient.delete(`/hospital/doctors/${doctor._id}`);
      setNotification({ type: 'success', message: 'Doctor removed.' });
      fetchDoctors();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to remove doctor.',
      });
    }
  };

  return (
    <HospitalAdminLayout
      title="Doctors Directory"
      subtitle="Manage specialties, experience, and availability."
      actions={
        <Button onClick={openCreateModal}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Doctor
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
            <h3 className="text-lg font-semibold text-slate-900">Roster snapshot</h3>
            <p className="text-sm text-slate-500">
              {doctors.length} doctor{doctors.length === 1 ? '' : 's'} on record
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                fetchDoctors(event.target.value);
              }}
              className="min-w-[160px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Search by name or specialty"
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
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="Add doctors to improve routing and AI recommendations."
          className="bg-white"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Specialization</th>
                  <th className="px-4 py-3 font-medium">Experience</th>
                  <th className="px-4 py-3 font-medium">Expertise</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{doctor.name}</p>
                      <p className="text-xs text-slate-500">{doctor.timings || 'Timings TBD'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doctor.specialization}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {doctor.experienceYears ? `${doctor.experienceYears} yrs` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(doctor.expertiseTags || []).slice(0, 3).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={doctor.status === 'active' ? 'success' : 'neutral'}>
                        {doctor.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(doctor)}
                        >
                          <Edit3 className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600"
                          onClick={() => handleDelete(doctor)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
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

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add doctor' : `Edit ${activeDoctor?.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={DOCTOR_FORM_ID} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id={DOCTOR_FORM_ID} className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="doc-name">Name</Label>
              <Input
                id="doc-name"
                name="name"
                value={formState.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="doc-specialization">Specialization</Label>
              <Input
                id="doc-specialization"
                name="specialization"
                value={formState.specialization}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="doc-experience">Experience (years)</Label>
              <Input
                id="doc-experience"
                name="experienceYears"
                type="number"
                min="0"
                value={formState.experienceYears}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <Label htmlFor="doc-status">Status</Label>
              <Select
                id="doc-status"
                name="status"
                value={formState.status}
                onChange={handleFormChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="doc-expertise">Expertise tags</Label>
            <Input
              id="doc-expertise"
              name="expertiseTags"
              value={formState.expertiseTags}
              onChange={handleFormChange}
              placeholder="Cardiology, Telehealth..."
            />
          </div>
          <div>
            <Label htmlFor="doc-timings">Timings</Label>
            <Input
              id="doc-timings"
              name="timings"
              value={formState.timings}
              onChange={handleFormChange}
              placeholder="Mon-Fri, 9am-4pm"
            />
          </div>
          <div>
            <Label htmlFor="doc-description">Bio / Description</Label>
            <Textarea
              id="doc-description"
              name="description"
              rows={4}
              value={formState.description}
              onChange={handleFormChange}
            />
          </div>
          {modalMode === 'edit' && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <ShieldAlert className="mr-1 inline h-4 w-4" />
              Editing will immediately update recommendations surfaced to patients.
            </div>
          )}
        </form>
      </Modal>
    </HospitalAdminLayout>
  );
}

