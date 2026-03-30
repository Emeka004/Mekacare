'use client';

import { useState, useEffect } from 'react';
import { providerService } from '@/services';
import type { PregnancyProfile } from '@/types';
import { Baby, AlertTriangle, Search } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PregnancyProfile[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [highRiskOnly, setHighRiskOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    providerService.getPatients({ limit: 50, isHighRisk: highRiskOnly || undefined })
      .then(r => setPatients(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [highRiskOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor your patient list</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={highRiskOnly} onChange={e => setHighRiskOnly(e.target.checked)} className="rounded accent-red-500" />
          High risk only
        </label>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search patients…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Baby className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No patients found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map(p => (
            <div key={p.id} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-semibold text-sm flex-shrink-0">
                P
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm">Patient ID: {p.userId}</p>
                  {p.isHighRisk && (
                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                      <AlertTriangle className="w-3 h-3" /> High Risk
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.gestationalAge ? `${p.gestationalAge} weeks` : 'Gestational age unknown'}
                  {p.estimatedDueDate ? ` · EDD: ${new Date(p.estimatedDueDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
