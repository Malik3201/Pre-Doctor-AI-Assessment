import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Download,
  FileText,
  Heart,
  FlaskConical,
  Apple,
  ShieldAlert,
  Home,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import RiskBadge from '../../components/patient/RiskBadge';
import apiClient from '../../api/apiClient';
import EmptyState from '../../components/shared/EmptyState';
import useToast from '../../hooks/useToast';
import { usePatientBranding } from '../../context/PatientBrandingContext';

function Section({ title, icon: Icon, children, gradient = 'from-blue-50 to-indigo-50', iconColor = 'text-blue-600', defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 shadow-lg transition-all`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-full bg-white p-3 shadow-md ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 rounded-2xl bg-white/80 p-4 backdrop-blur">
          {children}
        </div>
      )}
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
  const { appointmentWhatsApp, hospitalName } = usePatientBranding();
  const [whatsAppNumber, setWhatsAppNumber] = useState(appointmentWhatsApp || '');

  const openWhatsAppAppointment = (doctorName) => {
    if (!whatsAppNumber) return;
    const cleanNumber = whatsAppNumber.replace(/[^0-9]/g, '');
    const doctorLabel = doctorName ? `with ${doctorName}` : '';
    const facilityLabel = hospitalName ? ` at ${hospitalName}` : '';
    const message = `Hi, I would like to book an appointment ${doctorLabel || facilityLabel || ''}. I have received an AI health assessment report.`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    setWhatsAppNumber(appointmentWhatsApp || '');
  }, [appointmentWhatsApp]);

  useEffect(() => {
    if (appointmentWhatsApp) return;
    let isMounted = true;
    (async () => {
      try {
        const response = await apiClient.get('/hospital/settings');
        if (isMounted) {
          setWhatsAppNumber(response.data?.hospital?.settings?.appointmentWhatsApp || '');
        }
      } catch {
        // silent fallback
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [appointmentWhatsApp]);

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
      link.download = `health-report-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast({ title: 'Report downloaded successfully!', variant: 'success' });
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
      title="Health Assessment Report"
      subtitle="Your complete AI-generated health assessment"
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
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-slate-600">
                  Generated on{' '}
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Pre-Assessment Report
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  AI-generated assessment to help your physician make informed decisions
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <RiskBadge level={report.riskLevel} />
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </Card>

          {/* Summary Section */}
          <Section title="Summary" icon={FileText} gradient="from-emerald-50 to-teal-50" iconColor="text-emerald-600">
            <p className="text-sm leading-relaxed text-slate-700">{report.summary}</p>
          </Section>

          {/* Possible Conditions */}
          {report.possibleConditions?.length > 0 && (
            <Section title="Possible Conditions" icon={Heart} gradient="from-rose-50 to-pink-50" iconColor="text-rose-600">
              <div className="space-y-3">
                {report.possibleConditions.map((condition, idx) => (
                  <div
                    key={condition.name || idx}
                    className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">
                        {idx + 1}. {condition.name || 'Condition'}
                      </p>
                      {condition.probability && (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                          {condition.probability}
                        </span>
                      )}
                    </div>
                    {condition.notes && (
                      <p className="mt-2 text-sm text-slate-600">{condition.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recommended Tests */}
          {report.recommendedTests?.length > 0 && (
            <Section title="Recommended Tests" icon={FlaskConical} gradient="from-violet-50 to-purple-50" iconColor="text-violet-600">
              <div className="space-y-3">
                {report.recommendedTests.map((test, idx) => (
                  <div
                    key={test.name || idx}
                    className="flex items-start gap-3 rounded-xl border border-violet-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {test.name || 'Diagnostic test'}
                      </p>
                      {test.notes && (
                        <p className="mt-1 text-sm text-slate-600">{test.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Diet Plan */}
          {report.dietPlan?.length > 0 && (
            <Section title="Diet Plan" icon={Apple} gradient="from-green-50 to-emerald-50" iconColor="text-green-600">
              <ul className="space-y-2">
                {report.dietPlan.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* What to Avoid */}
          {report.whatToAvoid?.length > 0 && (
            <Section title="What to Avoid" icon={ShieldAlert} gradient="from-orange-50 to-amber-50" iconColor="text-orange-600">
              <ul className="space-y-2">
                {report.whatToAvoid.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                      ✕
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Home Care */}
          {report.homeCare?.length > 0 && (
            <Section title="Home Care Guidance" icon={Home} gradient="from-sky-50 to-cyan-50" iconColor="text-sky-600">
              <ul className="space-y-2">
                {report.homeCare.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Recommended Doctor */}
          {report.recommendedDoctor && (
            <Section title="Recommended Doctor" icon={Stethoscope} gradient="from-indigo-50 to-blue-50" iconColor="text-indigo-600">
              <div className="space-y-2">
                <p className="text-lg font-bold text-slate-900">
                  {report.recommendedDoctor.name}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {report.recommendedDoctor.specialization || 'Specialist'}
                </p>
                {report.recommendedDoctor.timings && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Available:</span> {report.recommendedDoctor.timings}
                  </p>
                )}
                {report.recommendedDoctor.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {report.recommendedDoctor.description}
                  </p>
                )}
                {whatsAppNumber && (
                  <Button
                    onClick={() => openWhatsAppAppointment(report.recommendedDoctor.name)}
                    className="mt-4 w-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus-visible:ring-emerald-500"
                  >
                    
                    <MessageCircle className="mr-2 h-4 w-4 text-white" />
                    Make Quick Appointment
                  </Button>
                )}
              </div>
            </Section>
          )}

          {whatsAppNumber && !report.recommendedDoctor && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Need to speak with a doctor?</p>
                  <p className="text-xs text-slate-600">
                    Message the {hospitalName || 'care'} team on WhatsApp to secure a quick appointment.
                  </p>
                </div>
                <Button
                  onClick={() => openWhatsAppAppointment()}
                  className="w-full md:w-auto bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus-visible:ring-emerald-500"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-white" />
                  Make Quick Appointment
                </Button>
              </div>
            </div>
          )}

          {appointmentWhatsApp && !report.recommendedDoctor && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Need to speak with a doctor?</p>
                  <p className="text-xs text-slate-600">
                    Message the {hospitalName || 'care'} team on WhatsApp to secure a quick appointment.
                  </p>
                </div>
                <Button
                  onClick={() => openWhatsAppAppointment()}
                  className="w-full md:w-auto"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Make Quick Appointment
                </Button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900">Important Notice</h4>
                <p className="mt-1 text-sm text-amber-800">
                  This AI-generated pre-assessment is for informational purposes only and does not
                  replace professional medical diagnosis. Please consult your physician for final
                  evaluation and treatment. For any urgent symptoms, contact emergency services
                  immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="Report unavailable"
          description="We couldn't find this report. It may have been removed or belongs to another session."
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
