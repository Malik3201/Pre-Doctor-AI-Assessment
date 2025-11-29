import { useEffect, useMemo, useState } from 'react';
import { Activity, Building2, Cpu, RefreshCcw, TrendingUp, Users2 } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import ErrorBanner from '../../components/shared/ErrorBanner';
import apiClient from '../../api/apiClient';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export default function SuperDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [analyticsRes, hospitalsRes] = await Promise.all([
        apiClient.get('/super/analytics/overview'),
        apiClient.get('/super/hospitals'),
      ]);
      setAnalytics(analyticsRes.data);
      setHospitals(hospitalsRes.data?.hospitals || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load analytics right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statItems = useMemo(() => {
    if (!analytics) {
      return [];
    }
    return [
      { label: 'Total Hospitals', value: numberFormatter.format(analytics.totalHospitals || 0), icon: Building2 },
      { label: 'Active Hospitals', value: numberFormatter.format(analytics.activeHospitals || 0), icon: Cpu },
      { label: 'Patients', value: numberFormatter.format(analytics.totalPatients || 0), icon: Users2 },
      { label: 'AI Checks Logged', value: numberFormatter.format(analytics.totalAiChecks || 0), icon: Activity },
    ];
  }, [analytics]);

  const topHospitals = useMemo(() => {
    if (!hospitals?.length) return [];
    return [...hospitals]
      .sort((a, b) => (b.aiChecksUsedThisMonth || 0) - (a.aiChecksUsedThisMonth || 0))
      .slice(0, 5);
  }, [hospitals]);

  const topHospitalsByPatients = useMemo(() => {
    if (!analytics?.hospitals?.length) return [];
    return [...analytics.hospitals]
      .sort((a, b) => (b.patientCount || 0) - (a.patientCount || 0))
      .slice(0, 5);
  }, [analytics?.hospitals]);

  const activityBlocks = [
    {
      label: 'AI checks consumed',
      value: analytics?.aiChecksUsedThisMonth || 0,
      target: analytics?.maxAiChecksPerMonth || 1,
    },
    {
      label: 'Reports generated',
      value: analytics?.totalReports || 0,
      target: (analytics?.totalReports || 1) * 1.2,
    },
    {
      label: 'Active patients',
      value: analytics?.totalPatients || 0,
      target: (analytics?.totalPatients || 1) * 1.5,
    },
  ];

  return (
    <SuperAdminLayout
      title="Executive Overview"
      subtitle="Monitor every tenant’s health, usage, and readiness in real time."
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
        <>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-5 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="mb-3 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Executive signal
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {analytics?.totalHospitals || 0} hospitals monitored
                </h2>
                <p className="text-sm text-slate-500">
                  {numberFormatter.format(analytics?.totalAiChecks || 0)} AI checks logged overall •{' '}
                  {numberFormatter.format(analytics?.activeHospitals || 0)} active this week
                </p>
              </div>
              <Badge variant="neutral" className="inline-flex items-center gap-2 text-xs">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Usage steady
              </Badge>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat) => (
              <StatCard key={stat.label} {...stat} className="rounded-2xl border border-slate-200" />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="space-y-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Activity overview</h3>
                  <p className="text-sm text-slate-500">
                    Usage bars adjust relative to configured monthly capacity.
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
                {activityBlocks.map((block) => {
                  const percent = Math.min(100, Math.round((block.value / block.target) * 100));
                  return (
                    <div key={block.label}>
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-medium text-slate-600">{block.label}</p>
                        <span className="text-slate-900">
                          {numberFormatter.format(block.value)}{' '}
                          <span className="text-xs text-slate-500">({percent}% of target)</span>
                        </span>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Top hospitals by AI usage</h3>
                  <p className="text-sm text-slate-500">Ranked by AI checks this billing period</p>
                </div>
                <Badge variant="neutral">{topHospitals.length || 0} tracked</Badge>
              </div>
              {topHospitals.length === 0 ? (
                <p className="text-sm text-slate-500">No hospitals available yet.</p>
              ) : (
                <div className="space-y-3">
                  {topHospitals.map((hospital, index) => (
                    <div
                      key={hospital._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          #{index + 1}
                        </p>
                        <p className="font-semibold text-slate-900">{hospital.name}</p>
                        <p className="text-xs text-slate-500">
                          {hospital.subdomain}.yourdomain.com
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {numberFormatter.format(hospital.aiChecksUsedThisMonth || 0)} checks
                        </p>
                        <p className="text-xs text-slate-500">
                          {hospital.planName || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Top hospitals by patient volume</h3>
                  <p className="text-sm text-slate-500">Ranked by total registered patients</p>
                </div>
                <Badge variant="neutral">{topHospitalsByPatients.length || 0} tracked</Badge>
              </div>
              {topHospitalsByPatients.length === 0 ? (
                <p className="text-sm text-slate-500">No patient data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {topHospitalsByPatients.map((hospital, index) => (
                    <div
                      key={hospital.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          #{index + 1}
                        </p>
                        <p className="font-semibold text-slate-900">{hospital.name}</p>
                        <p className="text-xs text-slate-500">
                          {hospital.subdomain}.yourdomain.com
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {numberFormatter.format(hospital.patientCount || 0)} patients
                        </p>
                        <p className="text-xs text-slate-500">
                          {hospital.activePatientCount || 0} active / {hospital.bannedPatientCount || 0} banned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Platform snapshot</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Super admins</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalSuperAdmins || 1)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Hospital admins</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalHospitalAdmins || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Banned hospitals</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.bannedHospitals || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total users</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalUsers || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Next actions</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  • Review suspended hospitals to keep customer health on track.{' '}
                  <span className="text-slate-400">
                    {numberFormatter.format(analytics?.suspendedHospitals || 0)} suspended
                  </span>
                </li>
                <li>
                  • Monitor AI checks:{' '}
                  {numberFormatter.format(analytics?.aiChecksUsedThisMonth || 0)}/
                  {numberFormatter.format(analytics?.maxAiChecksPerMonth || 0)} this cycle.
                </li>
                <li>• Ensure plans align with usage spikes ahead of renewals.</li>
              </ul>
            </Card>
          </section>
          </div>
      )}
    </SuperAdminLayout>
  );
}
