import { Activity, BarChart3, LineChart, TrendingUp } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/shared/EmptyState';
import Badge from '../../components/ui/Badge';

export default function SuperAnalyticsPage() {
  return (
    <SuperAdminLayout
      title="Global Analytics"
      subtitle="Cross-tenant KPIs, AI usage heatmaps, and customer health scoring."
    >
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Realtime signals</h3>
        <p className="text-sm text-slate-500">
              Aggregated metrics dashboard for platform-wide visibility and decision-making.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Planned metrics</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                AI token consumption
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Quota saturation rates
              </li>
              <li className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-500" />
                Conversion funnels
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Upcoming features</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Usage heatmaps by region</li>
              <li>• Customer health scoring</li>
              <li>• Adoption trajectory charts</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <div className="mt-3">
              <Badge variant="warning" className="text-xs">
                In development
              </Badge>
              <p className="mt-2 text-xs text-slate-500">
                Telemetry endpoints are being instrumented. Analytics will populate once backend
                exposes richer metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      <EmptyState
        icon={LineChart}
        title="Analytics module in progress"
        description="Once telemetry endpoints are connected, visualize uptime, AI usage bursts, and adoption trajectories."
        className="bg-white"
      />
    </SuperAdminLayout>
  );
}

