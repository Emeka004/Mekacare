'use client';

import { ShieldCheck, Info } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 text-sm mt-1">System configuration and administration</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-pink-500" />
          <h2 className="font-semibold text-gray-900">Platform Information</h2>
        </div>

        {[
          { label: 'Platform Name',    value: 'PregnancyCare' },
          { label: 'Version',          value: '1.0.0' },
          { label: 'Environment',      value: process.env.NODE_ENV ?? 'production' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Advanced platform settings are managed through environment variables and server configuration.</p>
      </div>
    </div>
  );
}
