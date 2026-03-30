'use client';

import { useState, useEffect } from 'react';
import { riskService } from '@/services';
import { AlertTriangle, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

function useRisks() {
  const [data, setData] = useState<Awaited<ReturnType<typeof riskService.getAll>> | null>(null);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    riskService.getAll().then(setData).finally(() => setLoading(false));
  }, []);
  return { data, isLoading };
}

const SEVERITY_COLORS: Record<string, string> = {
  low:      'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function RisksPage() {
  const { data, isLoading } = useRisks();
  const reports = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Report and track concerning symptoms</p>
        </div>
        <Link href="/risks/new" className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Report risk
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>⚠️ Emergency?</strong> If you are experiencing a medical emergency, call your local emergency line immediately. Do not wait for a response on this platform.
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No risk reports filed</p>
          </div>
        ) : reports.map((r) => (
          <Link key={r.id} href={`/risks/${r.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{r.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{format(new Date(r.createdAt), 'MMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${SEVERITY_COLORS[r.severity] ?? ''}`}>{r.severity}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
