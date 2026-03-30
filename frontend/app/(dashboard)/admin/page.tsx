'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services';
import { Users, Stethoscope, Baby, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{ totalUsers: number; patients: number; providers: number; activePatients: number } | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    userService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users',      value: stats?.totalUsers ?? 0,      icon: Users,       color: 'bg-blue-100 text-blue-600' },
    { label: 'Patients',         value: stats?.patients ?? 0,         icon: Baby,        color: 'bg-pink-100 text-pink-600' },
    { label: 'Providers',        value: stats?.providers ?? 0,        icon: Stethoscope, color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Patients',  value: stats?.activePatients ?? 0,   icon: Activity,    color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map(n => <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)
          : cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { href: '/admin/users',         label: 'Manage Users',          desc: 'View and manage all platform users' },
          { href: '/admin/providers',     label: 'Manage Providers',      desc: 'Review and verify healthcare providers' },
          { href: '/admin/risks',         label: 'Risk Reports',          desc: 'Monitor all patient risk submissions' },
          { href: '/admin/education',     label: 'Education Content',     desc: 'Publish and manage educational content' },
          { href: '/admin/notifications', label: 'Broadcast',             desc: 'Send announcements to all users' },
          { href: '/admin/settings',      label: 'Platform Settings',     desc: 'Configure system-wide settings' },
        ].map(({ href, label, desc }) => (
          <a key={href} href={href} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
