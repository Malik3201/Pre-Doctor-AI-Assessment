import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, ShieldAlert, UsersRound } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/shared/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Banned', value: 'banned' },
];

export default function HospitalPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const { showToast } = useToast();

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

      <Card className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Patient roster</h3>
            <p className="text-sm text-slate-500">
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
        <div className="flex min-h-[300px] items-center justify-center">
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
        <Card className="overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">
                        Joined{' '}
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={patient.status === 'banned' ? 'danger' : 'success'}>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className={patient.status === 'banned' ? 'text-emerald-600' : 'text-rose-600'}
                        onClick={() =>
                          handleStatusToggle(patient, patient.status === 'banned' ? 'active' : 'banned')
                        }
                      >
                        {patient.status === 'banned' ? (
                          <>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Reinstate
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-4 w-4" />
                            Ban
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <ShieldAlert className="mr-2 inline h-4 w-4" />
        Compliance reminder: banning a patient blocks AI usage and report generation until they are
        reinstated.
      </div>
    </HospitalAdminLayout>
  );
}

