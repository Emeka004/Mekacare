'use client';

import { useState, useEffect } from 'react';
import { providerService } from '@/services';
import type { ProviderProfile } from '@/types';
import { Stethoscope, Star, Search } from 'lucide-react';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    providerService.getAll({ limit: 100 })
      .then(r => setProviders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
        <p className="text-gray-500 text-sm mt-1">All registered healthcare providers</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search providers…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Provider', 'Specialty', 'Hospital', 'Rating', 'Status', 'Verified'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading…</td></tr>
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No providers found
                </td>
              </tr>
            ) : providers.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">Dr. {p.user?.firstName} {p.user?.lastName}</p>
                  <p className="text-xs text-gray-400">{p.user?.email}</p>
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">{p.specialty.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-gray-500">{p.hospital ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                    <Star className="w-3 h-3 fill-amber-400" /> {p.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.acceptingPatients ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.acceptingPatients ? 'Accepting' : 'Closed'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.isVerified ? 'Verified' : 'Pending'}
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
