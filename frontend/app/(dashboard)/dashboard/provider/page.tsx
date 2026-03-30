'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useProviderDashboard } from '@/hooks';
import { Activity, Calendar, Users, AlertTriangle } from 'lucide-react';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useProviderDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Dr. {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Your patient care overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients',       value: data?.stats?.totalPatients ?? 0,      icon: Users,          color: 'bg-pink-100 text-pink-600' },
            { label: "Today's Appointments", value: data?.stats?.todayAppointments ?? 0,   icon: Calendar,       color: 'bg-blue-100 text-blue-600' },
            { label: 'Pending Reports',      value: data?.stats?.pendingReports ?? 0,      icon: AlertTriangle,  color: 'bg-orange-100 text-orange-600' },
            { label: 'High Risk Patients',   value: data?.stats?.highRiskPatients ?? 0,    icon: Activity,       color: 'bg-red-100 text-red-600' },
          ].map(({ label, value, icon: Icon, color }) => (
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
      )}
    </div>
  );
}
