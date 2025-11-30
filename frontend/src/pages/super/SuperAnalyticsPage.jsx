import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  FileText,
  LineChart,
  RefreshCcw,
  TrendingUp,
  Users2,
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import apiClient from '../../api/apiClient';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export default function SuperAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/super/analytics/overview');
      setAnalytics(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load analytics right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const statItems = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        label: 'Total Hospitals',
        value: numberFormatter.format(analytics.totalHospitals || 0),
        icon: Building2,
        change: analytics.activeHospitals
          ? `+${analytics.activeHospitals} active`
          : undefined,
        changeLabel: '',
      },
      {
        label: 'Total Patients',
        value: numberFormatter.format(analytics.totalPatients || 0),
        icon: Users2,
      },
      {
        label: 'Total Reports',
        value: numberFormatter.format(analytics.totalReports || 0),
        icon: FileText,
        change:
          analytics.reportsLast7Days && analytics.reportsLast30Days
            ? `+${analytics.reportsLast7Days}`
            : undefined,
        changeLabel: 'last 7 days',
      },
      {
        label: 'AI Checks',
        value: numberFormatter.format(analytics.totalAiChecks || 0),
        icon: Activity,
        change:
          analytics.aiChecksLast7Days && analytics.aiChecksLast30Days
            ? `+${analytics.aiChecksLast7Days}`
            : undefined,
        changeLabel: 'last 7 days',
      },
    ];
  }, [analytics]);

  const usagePercent = useMemo(() => {
    if (!analytics?.maxAiChecksPerMonth) return 0;
    return Math.min(
      100,
      Math.round(
        ((analytics.aiChecksUsedThisMonth || 0) / analytics.maxAiChecksPerMonth) * 100,
      ),
    );
  }, [analytics]);

  // Prepare chart data for last 7 days
  const chartData = useMemo(() => {
    if (!analytics?.dailyAiChecks || !analytics?.dailyReports) return null;

    // Get last 7 days dates
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Map data
    const aiChecksMap = new Map(
      analytics.dailyAiChecks.map((item) => [item.date, item.count]),
    );
    const reportsMap = new Map(
      analytics.dailyReports.map((item) => [item.date, item.count]),
    );

    return dates.map((date) => ({
      date,
      aiChecks: aiChecksMap.get(date) || 0,
      reports: reportsMap.get(date) || 0,
    }));
  }, [analytics]);

  const maxChartValue = useMemo(() => {
    if (!chartData) return 1;
    const maxAi = Math.max(...chartData.map((d) => d.aiChecks), 1);
    const maxReports = Math.max(...chartData.map((d) => d.reports), 1);
    return Math.max(maxAi, maxReports, 1);
  }, [chartData]);

  return (
    <SuperAdminLayout
      title="Global Analytics"
      subtitle="Cross-tenant KPIs, AI usage trends, and platform health metrics."
    >
      {error && (
        <div className="mb-6 space-y-3">
          <ErrorBanner message={error} />
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Status Badge */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Realtime Analytics</h3>
                  <p className="text-sm text-slate-500">
                    Aggregated metrics dashboard for platform-wide visibility and decision-making.
                  </p>
                </div>
              </div>
              <Badge variant="success" className="text-xs">
                Production
              </Badge>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              />
            ))}
          </section>

          {/* Usage Overview */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">AI Usage This Month</h3>
                  <p className="text-sm text-slate-500">
                    Current billing period consumption across all hospitals
                  </p>
                </div>
                <Badge variant="neutral">
                  {analytics?.billingPeriodStart
                    ? new Date(analytics.billingPeriodStart).toLocaleDateString()
                    : 'Current'}{' '}
                  –{' '}
                  {analytics?.billingPeriodEnd
                    ? new Date(analytics.billingPeriodEnd).toLocaleDateString()
                    : 'Cycle'}
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <p className="font-medium text-slate-600">Total AI Checks</p>
                    <span className="text-slate-900">
                      {numberFormatter.format(analytics?.aiChecksUsedThisMonth || 0)} /{' '}
                      {numberFormatter.format(analytics?.maxAiChecksPerMonth || 0)}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {usagePercent}% of monthly quota utilized
                  </p>
                </div>
              </div>
            </Card>

            <Card className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Platform Health</h3>
                <p className="text-sm text-slate-500">Status distribution across hospitals</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Active</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-900">
                    {numberFormatter.format(analytics?.activeHospitals || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-amber-700">Suspended</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-900">
                    {numberFormatter.format(analytics?.suspendedHospitals || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-rose-700">Banned</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-900">
                    {numberFormatter.format(analytics?.bannedHospitals || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Time-based Trends */}
          {chartData && (
            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">AI Checks Trend</h3>
                    <p className="text-sm text-slate-500">Last 7 days activity</p>
                  </div>
                  <Badge variant="neutral">
                    {analytics?.aiChecksLast7Days || 0} total
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-2 h-32">
                    {chartData.map((item) => {
                      const height = (item.aiChecks / maxChartValue) * 100;
                      return (
                        <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-emerald-500 transition-all hover:bg-emerald-600"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${item.date}: ${item.aiChecks} checks`}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-emerald-500" />
                      <span>AI Checks</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Reports Generated</h3>
                    <p className="text-sm text-slate-500">Last 7 days activity</p>
                  </div>
                  <Badge variant="neutral">
                    {analytics?.reportsLast7Days || 0} total
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-2 h-32">
                    {chartData.map((item) => {
                      const height = (item.reports / maxChartValue) * 100;
                      return (
                        <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${item.date}: ${item.reports} reports`}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-blue-500" />
                      <span>Reports</span>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Additional Metrics */}
          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">User Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Hospital Admins</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalHospitalAdmins || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Patients</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalPatients || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Super Admins</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalSuperAdmins || 0)}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Total Users</p>
                    <p className="text-sm font-bold text-slate-900">
                      {numberFormatter.format(analytics?.totalUsers || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Activity Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Last 7 Days
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">AI Checks</span>
                      <span className="font-semibold text-slate-900">
                        {numberFormatter.format(analytics?.aiChecksLast7Days || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Reports</span>
                      <span className="font-semibold text-slate-900">
                        {numberFormatter.format(analytics?.reportsLast7Days || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Last 30 Days
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">AI Checks</span>
                      <span className="font-semibold text-slate-900">
                        {numberFormatter.format(analytics?.aiChecksLast30Days || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Reports</span>
                      <span className="font-semibold text-slate-900">
                        {numberFormatter.format(analytics?.reportsLast30Days || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Key Metrics</h3>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total Hospitals</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalHospitals || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total Reports</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalReports || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total AI Checks</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalAiChecks || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      )}
    </SuperAdminLayout>
  );
}
