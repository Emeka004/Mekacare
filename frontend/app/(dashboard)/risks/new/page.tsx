'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { riskService } from '@/services';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['bleeding','hypertension','gestational_diabetes','preeclampsia','preterm_labor','infection','fetal_movement','other'] as const;
const SEVERITIES = ['low','moderate','high','critical'] as const;

const schema = z.object({
  title:            z.string().min(3, 'Title is required'),
  category:         z.enum(CATEGORIES),
  severity:         z.enum(SEVERITIES),
  description:      z.string().min(10, 'Please describe your symptoms in detail'),
  requiresEmergency:z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const SEVERITY_COLORS: Record<string, string> = {
  low:      'border-green-300 bg-green-50 text-green-700',
  moderate: 'border-amber-300 bg-amber-50 text-amber-700',
  high:     'border-orange-300 bg-orange-50 text-orange-700',
  critical: 'border-red-300 bg-red-50 text-red-700',
};

export default function NewRiskPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'other', severity: 'moderate', requiresEmergency: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await riskService.create(data);
      toast.success('Risk report submitted. A provider will review it shortly.');
      router.push('/risks');
    } catch {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/risks" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report a Risk</h1>
          <p className="text-gray-500 text-sm mt-0.5">Describe your symptoms for provider review</p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p><strong>Emergency?</strong> Call your local emergency services immediately. Do not wait for a response on this platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input {...register('title')} type="text" placeholder="Brief description of your concern"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select {...register('category')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Severity</label>
              <select {...register('severity')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
                {SEVERITIES.map(s => (
                  <option key={s} value={s} className={SEVERITY_COLORS[s]}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={5}
              placeholder="Describe your symptoms, when they started, and any other relevant details"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input {...register('requiresEmergency')} type="checkbox" className="rounded accent-red-500" />
            <span className="text-red-600 font-medium">This requires emergency attention</span>
          </label>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
            {isSubmitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
