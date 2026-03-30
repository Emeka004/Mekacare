'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAppointments } from '@/hooks';
import { Calendar, Plus, Video, MapPin } from 'lucide-react';

const STATUS_FILTERS = ['all', 'scheduled', 'confirmed', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
  scheduled:   'bg-amber-100 text-amber-700',
  confirmed:   'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-gray-100 text-gray-600',
  cancelled:   'bg-red-100 text-red-600',
  no_show:     'bg-orange-100 text-orange-700',
};

export default function AppointmentsPage() {
  const [activeStatus, setActiveStatus] = useState('all');
  const { data, isLoading } = useAppointments(
    activeStatus !== 'all' ? { status: activeStatus } : {}
  );
  const appointments = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your prenatal care schedule</p>
        </div>
        <Link href="/appointments/new"
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Book appointment
        </Link>
      </div>

      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              activeStatus === s ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}>{s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No appointments found</p>
          <p className="text-sm mt-1">Book your first prenatal appointment to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Link key={appt.id} href={`/appointments/${appt.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  {appt.isVirtual ? <Video className="w-5 h-5 text-pink-600" /> : <Calendar className="w-5 h-5 text-pink-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 capitalize">{appt.type.replace(/_/g, ' ')}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize flex-shrink-0 ${statusColors[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(appt.scheduledAt), 'EEEE, MMMM d, yyyy · h:mm a')}
                    {' · '}{appt.duration} min
                  </p>
                  {appt.provider && (
                    <p className="text-sm text-gray-600 mt-1">Dr. {appt.provider.firstName} {appt.provider.lastName}</p>
                  )}
                  {appt.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {appt.location}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
