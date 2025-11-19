import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Download, FileText } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import RiskBadge from '../../components/patient/RiskBadge';
import apiClient from '../../api/apiClient';
import EmptyState from '../../components/shared/EmptyState';
import useToast from '../../hooks/useToast';

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      <div className="mt-2 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
        {children}
      </div>
    </div>
  );
}

export default function PatientReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/patient/checkups/${id}`);
      setReport(response.data?.report);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load this report.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownload = async () => {
    try {
      const response = await apiClient.get(`/patient/checkups/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pre-assessment-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast({ title: 'Report downloaded', variant: 'success' });
    } catch (err) {
      showToast({
        title: 'Download failed',
        description: err?.response?.data?.message || 'Unable to download this report.',
        variant: 'error',
      });
    }
  };

  return (
    <PatientLayout
      title="Pre-assessment report"
      subtitle="AI-generated summary designed to help your physician."
      actions={
        <Button variant="outline" onClick={() => navigate('/app/reports')}>
          Back to reports
        </Button>
      }
    >
      {error && <ErrorBanner message={error} className="mb-6" />}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : report ? (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">
                  Generated on{' '}
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pre-assessment report</h2>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <RiskBadge level={report.riskLevel} />
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              This pre-assessment is informational and does not replace professional medical
              diagnosis. Please consult your physician for final evaluation.
            </p>
          </Card>

          <Section title="Summary">
            <p>{report.summary}</p>
          </Section>

          {report.possibleConditions?.length > 0 && (
            <Section title="Possible conditions">
              <ul className="list-disc space-y-2 pl-5">
                {report.possibleConditions.map((condition, idx) => (
                  <li key={condition.name || idx}>
                    <span className="font-semibold">{condition.name || 'Condition'}</span>
                    {condition.probability && (
                      <span className="text-xs text-slate-500"> • {condition.probability}</span>
                    )}
                    {condition.notes && <p className="text-xs text-slate-500">{condition.notes}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {report.recommendedTests?.length > 0 && (
            <Section title="Recommended tests">
              <ul className="space-y-2">
                {report.recommendedTests.map((test, idx) => (
                  <li key={test.name || idx} className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-slate-900">{test.name || 'Diagnostic test'}</p>
                      {test.notes && <p className="text-xs text-slate-500">{test.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {report.dietPlan?.length > 0 && (
            <Section title="Diet plan">
              <ul className="list-disc space-y-2 pl-5">
                {report.dietPlan.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </Section>
          )}

          {report.whatToAvoid?.length > 0 && (
            <Section title="What to avoid">
              <ul className="list-disc space-y-2 pl-5">
                {report.whatToAvoid.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </Section>
          )}

          {report.homeCare?.length > 0 && (
            <Section title="Home care guidance">
              <ul className="list-disc space-y-2 pl-5">
                {report.homeCare.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </Section>
          )}

          {report.recommendedDoctor && (
            <Section title="Recommended doctor">
              <p className="font-semibold text-slate-900">{report.recommendedDoctor.name}</p>
              <p className="text-sm text-slate-500">
                {report.recommendedDoctor.specialization || 'Specialist'}
              </p>
              {report.recommendedDoctor.timings && (
                <p className="text-xs text-slate-500 mt-1">Timings: {report.recommendedDoctor.timings}</p>
              )}
            </Section>
          )}

          <Card className="flex items-center gap-3 border border-amber-100 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">
              This AI-generated pre-assessment is for guidance only. For any urgent symptoms, contact
              emergency services immediately.
            </p>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="Report unavailable"
          description="We couldn’t find this report. It may have been removed or belongs to another session."
          className="bg-white"
          action={
            <Button variant="outline" onClick={() => navigate('/app/reports')}>
              Back to reports
            </Button>
          }
        />
      )}
    </PatientLayout>
  );
}

