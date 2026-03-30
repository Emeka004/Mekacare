'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { appointmentService, providerService } from '@/services';
import type { ProviderProfile } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const APPOINTMENT_TYPES = [
  'prenatal_checkup', 'ultrasound', 'blood_test',
  'consultation', 'emergency', 'postpartum', 'virtual',
] as const;

const schema = z.object({
  providerId:  z.string().min(1, 'Select a provider'),
  scheduledAt: z.string().min(1, 'Choose a date and time'),
  type:        z.enum(APPOINTMENT_TYPES),
  duration:    z.coerce.number().min(15).max(180).optional(),
  reason:      z.string().optional(),
  isVirtual:   z.boolean().optional(),
  location:    z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);

  useEffect(() => {
    providerService.getAll({ acceptingPatients: true, limit: 50 })
      .then(r => setProviders(r.data))
      .catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'prenatal_checkup', duration: 30, isVirtual: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await appointmentService.create({
        providerId:  data.providerId!,
        scheduledAt: data.scheduledAt!,
        type:        data.type!,
        duration:    data.duration,
        reason:      data.reason,
        isVirtual:   data.isVirtual,
        location:    data.location,
      });
      toast.success('Appointment booked!');
      router.push('/appointments');
    } catch {
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/appointments" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-500 text-sm mt-0.5">Schedule a new prenatal care visit</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label htmlFor="providerId" className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
            <select {...register('providerId')} id="providerId"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
              <option value="">Select a provider</option>
              {providers.map(p => (
                <option key={p.id} value={p.userId}>
                  Dr. {p.user?.firstName} {p.user?.lastName} — {p.specialty.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.providerId && <p className="mt-1 text-xs text-red-500">{errors.providerId.message}</p>}
          </div>

          <div>
            <label htmlFor="appt-type" className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select {...register('type')} id="appt-type"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
              {APPOINTMENT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1.5">Date &amp; Time</label>
            <input {...register('scheduledAt')} id="scheduledAt" type="datetime-local"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
            {errors.scheduledAt && <p className="mt-1 text-xs text-red-500">{errors.scheduledAt.message}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
            <input {...register('duration')} id="duration" type="number" min={15} max={180} step={15}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Location (optional)</label>
            <input {...register('location')} id="location" type="text" placeholder="Clinic address or meeting link"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
            <textarea {...register('reason')} id="reason" rows={3} placeholder="Briefly describe the reason for this visit"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input {...register('isVirtual')} type="checkbox" className="rounded" />
            Virtual appointment
          </label>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
            {isSubmitting ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
