import { Activity, LineChart } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/shared/EmptyState';

export default function SuperAnalyticsPage() {
  return (
    <SuperAdminLayout
      title="Global Analytics"
      subtitle="Cross-tenant KPIs, AI usage heatmaps, and customer health scoring."
    >
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900">Realtime Signals</h3>
        <p className="text-sm text-slate-500">
          Later milestones will show aggregated metrics here (AI token burn, quota saturation,
          conversion funnels).
        </p>
      </Card>
      <EmptyState
        icon={LineChart}
        title="Analytics module in progress"
        description="Once telemetry endpoints are connected, visualize uptime, AI usage bursts, and adoption trajectories."
        className="bg-white"
      />
    </SuperAdminLayout>
  );
}

