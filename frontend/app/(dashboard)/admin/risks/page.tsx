'use client';

import { useState, useEffect } from 'react';
import { riskService } from '@/services';
import type { RiskReport } from '@/types';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const SEVERITY_COLORS: Record<string, string> = {
  low:      'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  open:         'bg-red-100 text-red-700',
  under_review: 'bg-amber-100 text-amber-700',
  resolved:     'bg-green-100 text-green-700',
  escalated:    'bg-purple-100 text-purple-700',
};

export default function AdminRisksPage() {
  const [reports, setReports] = useState<RiskReport[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('all');

  useEffect(() => {
    setLoading(true);
    riskService.getAll({ limit: 100, severity: severity !== 'all' ? severity as RiskReport['severity'] : undefined })
      .then(r => setReports(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [severity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Reports</h1>
        <p className="text-gray-500 text-sm mt-1">All patient-submitted risk reports</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {['all', 'critical', 'high', 'moderate', 'low'].map(s => (
          <button key={s} onClick={() => setSeverity(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${severity === s ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No risk reports found</p>
          </div>
        ) : reports.map(r => (
          <Link key={r.id} href={`/risks/${r.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{r.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {r.patient ? `${r.patient.firstName} ${r.patient.lastName} · ` : ''}
                {format(new Date(r.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${SEVERITY_COLORS[r.severity] ?? ''}`}>{r.severity}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[r.status] ?? ''}`}>{r.status.replace(/_/g, ' ')}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
