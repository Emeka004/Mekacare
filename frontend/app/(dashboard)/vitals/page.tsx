'use client';

import { useVitals, useLatestVital } from '@/hooks';
import { Activity, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function VitalsPage() {
  const { data, isLoading } = useVitals({ limit: 20 });
  const { data: latest } = useLatestVital();
  const vitals = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vital Signs</h1>
          <p className="text-gray-500 text-sm mt-1">Track your health metrics throughout pregnancy</p>
        </div>
        <Link href="/vitals/new" className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Log vitals
        </Link>
      </div>

      {latest && (
        <div className={`p-4 rounded-2xl border ${latest.isAbnormal ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-sm font-semibold text-gray-700 mb-2">Latest Reading — {format(new Date(latest.recordedAt), 'MMM d, yyyy · h:mm a')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Blood Pressure',  value: `${latest.bloodPressureSystolic ?? '—'}/${latest.bloodPressureDiastolic ?? '—'} mmHg` },
              { label: 'Fetal Heart Rate', value: latest.fetalHeartRate ? `${latest.fetalHeartRate} bpm` : '—' },
              { label: 'Weight',           value: latest.weight ? `${latest.weight} kg` : '—' },
              { label: 'SpO₂',             value: latest.oxygenSaturation ? `${latest.oxygenSaturation}%` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          {latest.isAbnormal && (
            <p className="mt-3 text-xs text-red-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Abnormal: {latest.abnormalFlags.join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Date', 'BP', 'FHR', 'Weight', 'SpO₂', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading…</td></tr>
            ) : vitals.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No vitals recorded yet</td></tr>
            ) : vitals.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{format(new Date(v.recordedAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</td>
                <td className="px-4 py-3">{v.fetalHeartRate ?? '—'}</td>
                <td className="px-4 py-3">{v.weight ?? '—'} kg</td>
                <td className="px-4 py-3">{v.oxygenSaturation ?? '—'}%</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.isAbnormal ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {v.isAbnormal ? '⚠ Abnormal' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
