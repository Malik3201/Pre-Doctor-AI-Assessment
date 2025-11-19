import { useEffect, useMemo, useState } from 'react';
import { Activity, Building2, Cpu, RefreshCcw, Users2 } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import apiClient from '../../api/apiClient';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

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

  return (
    <SuperAdminLayout title="Super Admin Command" subtitle="Global visibility across every tenant.">
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
        <div className="flex min-h-[300px] items-center justify-center">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Top Hospitals by AI Usage</h3>
                  <p className="text-sm text-slate-500">Based on AI checks this billing period.</p>
                </div>
                <Badge variant="neutral">{topHospitals.length} tracked</Badge>
              </div>
              {topHospitals.length === 0 ? (
                <p className="text-sm text-slate-500">No hospitals available yet.</p>
              ) : (
                <div className="space-y-3">
                  {topHospitals.map((hospital) => (
                    <div
                      key={hospital._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{hospital.name}</p>
                        <p className="text-xs text-slate-500">{hospital.subdomain}.yourdomain.com</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {numberFormatter.format(hospital.aiChecksUsedThisMonth || 0)} checks
                        </p>
                        <p className="text-xs text-slate-500">
                          Plan: {hospital.planName || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Platform Snapshot</h3>
                <p className="text-sm text-slate-500">
                  High-level service indicators based on backend telemetry.
                </p>
              </div>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  Super admins:{' '}
                  <span className="font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalSuperAdmins || 1)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  Hospital admins:{' '}
                  <span className="font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalHospitalAdmins || 0)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  Banned hospitals:{' '}
                  <span className="font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.bannedHospitals || 0)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  Total users:{' '}
                  <span className="font-semibold text-slate-900">
                    {numberFormatter.format(analytics?.totalUsers || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </SuperAdminLayout>
  );
}
