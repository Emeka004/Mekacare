'use client';

import { useState, useEffect } from 'react';
import { providerService } from '@/services';
import type { ProviderProfile } from '@/types';
import { Stethoscope, Star, Search } from 'lucide-react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    providerService.getAll({ limit: 50, search: search || undefined })
      .then(r => setProviders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Provider</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and connect with prenatal care specialists</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or specialty…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No providers found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {providers.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-semibold flex-shrink-0">
                  {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Dr. {p.user?.firstName} {p.user?.lastName}</p>
                  <p className="text-xs text-pink-600 capitalize mt-0.5">{p.specialty.replace(/_/g, ' ')}</p>
                  {p.hospital && <p className="text-xs text-gray-400 mt-0.5">{p.hospital}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-amber-400" /> {p.rating.toFixed(1)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.acceptingPatients ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.acceptingPatients ? 'Accepting patients' : 'Not accepting'}
                    </span>
                  </div>
                </div>
              </div>
              {p.bio && <p className="text-xs text-gray-500 mt-3 line-clamp-2">{p.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
