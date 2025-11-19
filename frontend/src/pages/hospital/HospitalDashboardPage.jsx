import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, FileText, RefreshCcw, Stethoscope, UsersRound } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/apiClient';

const numberFormatter = new Intl.NumberFormat('en-US');

export default function HospitalDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [analyticsResponse, settingsResponse] = await Promise.all([
        apiClient.get('/hospital/analytics/overview'),
        apiClient.get('/hospital/settings'),
      ]);
      setAnalytics(analyticsResponse.data);
      setSettings(settingsResponse.data?.hospital);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load dashboard data right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statItems = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        label: 'Doctors',
        value: numberFormatter.format(analytics.totalDoctors || 0),
        icon: Stethoscope,
      },
      {
        label: 'Patients',
        value: numberFormatter.format(analytics.totalPatients || 0),
        icon: UsersRound,
      },
      {
        label: 'Reports',
        value: numberFormatter.format(analytics.totalReports || 0),
        icon: FileText,
      },
      {
        label: 'AI Checks',
        value: numberFormatter.format(analytics.totalAiChecks || analytics.totalReports || 0),
        icon: Activity,
      },
    ];
  }, [analytics]);

  const usagePercent = useMemo(() => {
    if (!analytics?.maxAiChecksPerMonth) return 0;
    return Math.min(
      100,
      Math.round(((analytics.aiChecksUsedThisMonth || 0) / analytics.maxAiChecksPerMonth) * 100),
    );
  }, [analytics]);

  return (
    <HospitalAdminLayout
      title="Hospital Command"
      subtitle="Track patient flow and AI usage."
      hospitalName={settings?.name}
    >
      {error && (
        <div className="mb-6 space-y-3">
          <ErrorBanner message={error} />
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Plan usage</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {analytics?.planName || 'Unassigned'}
                  </h3>
                </div>
                <Badge variant={usagePercent >= 90 ? 'warning' : 'neutral'}>
                  {usagePercent}% used
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {numberFormatter.format(analytics?.aiChecksUsedThisMonth || 0)} /{' '}
                {numberFormatter.format(analytics?.maxAiChecksPerMonth || 0)} AI checks this billing
                period.
              </p>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="mt-4 flex justify-between text-xs text-slate-500">
                <span>
                  Start:{' '}
                  {analytics?.billingPeriodStart
                    ? new Date(analytics.billingPeriodStart).toLocaleDateString()
                    : '—'}
                </span>
                <span>
                  End:{' '}
                  {analytics?.billingPeriodEnd
                    ? new Date(analytics.billingPeriodEnd).toLocaleDateString()
                    : '—'}
                </span>
              </div>
            </Card>
            <Card>
              <p className="text-sm uppercase tracking-wide text-slate-500">Quick context</p>
              <h3 className="text-lg font-semibold text-slate-900">{settings?.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{settings?.settings?.emergencyText}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                <Badge variant="neutral">
                  Assistant: {settings?.settings?.assistantName || 'Not set'}
                </Badge>
                <Badge variant="neutral">
                  Tone: {settings?.settings?.assistantTone || 'Default'}
                </Badge>
                <Badge variant="neutral">
                  Language: {settings?.settings?.assistantLanguage || 'En'}
                </Badge>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900">Recent highlights</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  {statItems[2]?.value || 0} reports generated — review summaries for at-risk
                  patients.
                </li>
                <li>
                  {analytics?.bannedPatients || 0} patients currently banned — confirm compliance if
                  lifting restrictions.
                </li>
                <li>
                  Keep doctors directory up to date to improve AI recommendations.
                </li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-slate-900">Next actions</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>• Update branding and assistant tone to reflect current campaigns.</p>
                <p>• Review patient bans weekly to ensure eligibility.</p>
                <p>• Monitor AI quota, consider upgrade when usage stays above 80%.</p>
              </div>
            </Card>
          </div>
        </>
      )}
    </HospitalAdminLayout>
  );
}

