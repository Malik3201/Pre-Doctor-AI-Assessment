import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, Eye, FileText, ShieldAlert, UsersRound } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/shared/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Banned', value: 'banned' },
];

const riskBadgeMap = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

export default function HospitalPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const { showToast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchPatients = useCallback(
    async (statusParam, searchParam) => {
      const effectiveStatus = statusParam ?? statusFilter;
      const effectiveSearch = searchParam ?? appliedSearch;
      setIsLoading(true);
      setError('');
      try {
        const params = { limit: 100 };
        if (effectiveStatus !== 'all') params.status = effectiveStatus;
        if (effectiveSearch) params.search = effectiveSearch;
        const response = await apiClient.get('/hospital/patients', { params });
        setPatients(response.data?.patients || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load patients.');
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, appliedSearch],
  );

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => patients, [patients]);

  const handleApplySearch = () => {
    setAppliedSearch(searchInput);
    fetchPatients(statusFilter, searchInput);
  };

  const handleStatusChange = (nextStatus) => {
    setStatusFilter(nextStatus);
    fetchPatients(nextStatus, appliedSearch);
  };

  const handleStatusToggle = async (patient, nextStatus) => {
    setNotification(null);
    try {
      await apiClient.patch(`/hospital/patients/${patient._id}/ban`, { status: nextStatus });
      const msg = `Patient ${nextStatus === 'banned' ? 'banned' : 'reinstated'}.`;
      setNotification({
        type: 'success',
        message: msg,
      });
      showToast({
        title: msg,
        variant: nextStatus === 'banned' ? 'warning' : 'success',
      });
      fetchPatients(statusFilter, appliedSearch);
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update patient status.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({ title: 'Update failed', description: message, variant: 'error' });
    }
  };

  const handleViewPatient = async (patientId) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    setSelectedPatient(null);
    try {
      const response = await apiClient.get(`/hospital/patients/${patientId}`);
      setSelectedPatient(response.data?.patient || null);
    } catch (err) {
      showToast({
        title: 'Unable to load patient details',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'error',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const formatCNIC = (cnic) => {
    if (!cnic) return 'N/A';
    const digits = cnic.replace(/\D/g, '');
    if (digits.length === 13) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
    }
    return cnic;
  };

  return (
    <HospitalAdminLayout
      title="Patient Management"
      subtitle="Review patient accounts, ban/unban access, and monitor AI history."
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

      <Card className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Patient roster</p>
            <p className="text-xs text-slate-500">
              {patients.length} patient{patients.length === 1 ? '' : 's'} returned
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="min-w-[140px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Search name or email"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full sm:w-64"
              />
              <Button variant="outline" onClick={handleApplySearch}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No patients match"
          description="Adjust filters or wait for new registrations."
          className="bg-white"
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Age</th>
                  <th className="px-6 py-4 font-medium">Gender</th>
                  <th className="px-6 py-4 font-medium">CNIC</th>
                  <th className="px-6 py-4 font-medium">Reports</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">
                        Joined{' '}
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{patient.email}</td>
                    <td className="px-6 py-4 text-slate-700">{patient.age ?? 'N/A'}</td>
                    <td className="px-6 py-4 capitalize text-slate-700">
                      {patient.gender?.replace('_', ' ') ?? 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {formatCNIC(patient.cnic)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{patient.reportCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={patient.status === 'banned' ? 'danger' : 'success'}>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPatient(patient._id)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        {patient.status === 'banned' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 focus-visible:ring-emerald-500"
                            onClick={() => handleStatusToggle(patient, 'active')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Reinstate
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatusToggle(patient, 'banned')}
                          >
                            <Ban className="mr-1 h-4 w-4" />
                            Ban
                          </Button>
                        )}
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
            Compliance reminder: banning a patient blocks AI usage and report generation until they are
            reinstated.
          </p>
        </div>
      </Card>

      {/* Patient Detail Modal */}
      <Modal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Patient Details"
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
        ) : selectedPatient ? (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPatient.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-sm text-slate-700">{selectedPatient.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Age</p>
                <p className="mt-1 text-sm text-slate-700">{selectedPatient.age ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gender</p>
                <p className="mt-1 text-sm capitalize text-slate-700">
                  {selectedPatient.gender?.replace('_', ' ') ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">CNIC</p>
                <p className="mt-1 font-mono text-sm text-slate-700">
                  {formatCNIC(selectedPatient.cnic)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-1">
                  <Badge variant={selectedPatient.status === 'banned' ? 'danger' : 'success'}>
                    {selectedPatient.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Registered</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedPatient.createdAt
                    ? new Date(selectedPatient.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Updated</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedPatient.updatedAt
                    ? new Date(selectedPatient.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Report Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-slate-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total AI Reports
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedPatient.reportCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            {selectedPatient.recentReports && selectedPatient.recentReports.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Recent Reports</h4>
                <div className="space-y-3">
                  {selectedPatient.recentReports.map((report) => (
                    <div
                      key={report._id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-slate-500">
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString()
                            : 'Unknown date'}
                        </p>
                        <p className="mt-1 text-sm text-slate-700 line-clamp-1">
                          {report.summary || 'No summary available'}
                        </p>
                      </div>
                      <Badge variant={riskBadgeMap[report.riskLevel] || 'neutral'}>
                        {report.riskLevel || 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500">No patient data available</p>
        )}
      </Modal>
    </HospitalAdminLayout>
  );
}

