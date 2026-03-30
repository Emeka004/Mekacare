'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { notificationService } from '@/services';
import { Bell } from 'lucide-react';

const schema = z.object({
  title:      z.string().min(1, 'Title is required'),
  message:    z.string().min(5, 'Message is required'),
  priority:   z.enum(['low', 'normal', 'high', 'urgent']),
  roleTarget: z.enum(['all', 'patient', 'provider']),
});
type FormData = z.infer<typeof schema>;

export default function AdminNotificationsPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'normal', roleTarget: 'all' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await notificationService.broadcast({
        ...data,
        type: 'broadcast',
        roleTarget: data.roleTarget !== 'all' ? data.roleTarget : undefined,
      });
      toast.success('Broadcast sent successfully!');
      reset();
    } catch {
      toast.error('Failed to send broadcast.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Send announcements to users on the platform</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-pink-500" />
          <h2 className="font-semibold text-gray-900">New Broadcast</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input {...register('title')} type="text" placeholder="Notification title"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea {...register('message')} rows={4} placeholder="Write your message here…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select {...register('priority')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
              <select {...register('roleTarget')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
                <option value="all">All Users</option>
                <option value="patient">Patients Only</option>
                <option value="provider">Providers Only</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
            {isSubmitting ? 'Sending…' : 'Send Broadcast'}
          </button>
        </form>
      </div>
    </div>
  );
}
