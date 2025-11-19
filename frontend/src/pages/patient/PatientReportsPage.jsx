import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import EmptyState from '../../components/shared/EmptyState';
import RiskBadge from '../../components/patient/RiskBadge';
import apiClient from '../../api/apiClient';

const riskFilters = [
  { label: 'All risk levels', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export default function PatientReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [riskLevel, setRiskLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(
    async (filter) => {
      const nextFilter = filter ?? riskLevel;
      setIsLoading(true);
      setError('');
      try {
        const params = { limit: 100 };
        if (nextFilter !== 'all') {
          params.riskLevel = nextFilter;
        }
        const response = await apiClient.get('/patient/checkups', { params });
        setReports(response.data?.reports || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your reports right now.');
      } finally {
        setIsLoading(false);
      }
    },
    [riskLevel],
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <PatientLayout title="Your Reports" subtitle="All AI-assisted pre-assessments in one place.">
      <Card className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-3 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Report timeline</h3>
              <p className="text-sm text-slate-500">Filter by risk level to review specific cases.</p>
            </div>
          </div>
          <Select
            value={riskLevel}
            onChange={(event) => {
              setRiskLevel(event.target.value);
              fetchReports(event.target.value);
            }}
            className="min-w-[180px]"
          >
            {riskFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error && (
        <div className="mb-6 space-y-3">
          <ErrorBanner message={error} />
          <Button variant="outline" size="sm" onClick={() => fetchReports()}>
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Once you complete an AI checkup, your reports will be available here."
          className="bg-white"
          action={
            <Button variant="outline" onClick={() => navigate('/app/checkup/new')}>
              Start a checkup
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report._id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">{report.summary}</p>
                {report.recommendedDoctor && (
                  <p className="mt-1 text-xs text-slate-500">
                    Recommended doctor: {report.recommendedDoctor.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <RiskBadge level={report.riskLevel} />
                <Button variant="outline" size="sm" onClick={() => navigate(`/app/reports/${report._id}`)}>
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PatientLayout>
  );
}

