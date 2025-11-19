import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart2, FileText, Stethoscope, UsersRound } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/shared/EmptyState';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/apiClient';

const numberFormatter = new Intl.NumberFormat('en-US');

export default function HospitalAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/hospital/analytics/overview');
      setAnalytics(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const statItems = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: 'Doctors', value: numberFormatter.format(analytics.totalDoctors || 0), icon: Stethoscope },
      { label: 'Patients', value: numberFormatter.format(analytics.totalPatients || 0), icon: UsersRound },
      { label: 'Reports', value: numberFormatter.format(analytics.totalReports || 0), icon: FileText },
      { label: 'AI Checks', value: numberFormatter.format(analytics.totalAiChecks || 0), icon: Activity },
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
      title="Analytics & Usage"
      subtitle="Monitor AI quota consumption and report generation trends."
    >
      {error && (
        <div className="mb-6 space-y-3">
          <ErrorBanner message={error} />
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            Refresh
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : !analytics ? (
        <EmptyState
          icon={Activity}
          title="No analytics available"
          description="Data will appear once the first patients complete assessments."
          className="bg-white"
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">Plan consumption</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {analytics.planName || 'No plan assigned'}
                </h3>
              </div>
              <Badge variant={usagePercent > 90 ? 'warning' : 'neutral'}>{usagePercent}% used</Badge>
            </div>
            <p className="text-sm text-slate-500">
              {numberFormatter.format(analytics.aiChecksUsedThisMonth || 0)} /{' '}
              {numberFormatter.format(analytics.maxAiChecksPerMonth || 0)} AI checks this cycle.
            </p>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500">
              Billing window:{' '}
              {analytics.billingPeriodStart
                ? new Date(analytics.billingPeriodStart).toLocaleDateString()
                : '—'}{' '}
              –{' '}
              {analytics.billingPeriodEnd
                ? new Date(analytics.billingPeriodEnd).toLocaleDateString()
                : '—'}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center gap-3">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Engagement summary</h3>
                  <p className="text-sm text-slate-500">
                    High-level interpretation of current patient traffic.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  • {numberFormatter.format(analytics.totalPatients || 0)} active patients — ensure
                  onboarding communications remain current.
                </li>
                <li>
                  • {numberFormatter.format(analytics.bannedPatients || 0)} banned patients — review
                  status weekly to avoid unnecessary blocks.
                </li>
                <li>
                  • {numberFormatter.format(analytics.totalReports || 0)} AI reports generated — keep
                  PDF templates aligned with brand.
                </li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-slate-900">Next instrumentation</h3>
              <p className="mt-2 text-sm text-slate-500">
                Detailed charts (risk mix, doctor load) will land once backend exposes richer
                telemetry. For now, monitor usage here and export logs from the admin API if needed.
              </p>
            </Card>
          </div>
        </div>
      )}
    </HospitalAdminLayout>
  );
}

