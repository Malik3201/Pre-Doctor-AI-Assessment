import { ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import RiskBadge from './RiskBadge';

export default function ReportSummaryCard({ report }) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {new Date(report.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{report.summary}</p>
          <div className="mt-3">
            <RiskBadge level={report.riskLevel} />
          </div>
        </div>
      </div>
      <Link
        to={`/app/reports/${report._id}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500"
      >
        View report
        <ChevronRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

