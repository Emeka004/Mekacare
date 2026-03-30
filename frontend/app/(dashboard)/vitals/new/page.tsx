'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { vitalService } from '@/services';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  weight:                  z.coerce.number().positive().optional(),
  bloodPressureSystolic:   z.coerce.number().positive().optional(),
  bloodPressureDiastolic:  z.coerce.number().positive().optional(),
  heartRate:               z.coerce.number().positive().optional(),
  temperature:             z.coerce.number().positive().optional(),
  fetalHeartRate:          z.coerce.number().positive().optional(),
  bloodGlucose:            z.coerce.number().positive().optional(),
  oxygenSaturation:        z.coerce.number().min(0).max(100).optional(),
  fundalHeight:            z.coerce.number().positive().optional(),
  hemoglobin:              z.coerce.number().positive().optional(),
  notes:                   z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const FIELDS = [
  { name: 'weight' as const,                 label: 'Weight',              unit: 'kg',   step: '0.1' },
  { name: 'bloodPressureSystolic' as const,  label: 'Blood Pressure (Systolic)',  unit: 'mmHg', step: '1' },
  { name: 'bloodPressureDiastolic' as const, label: 'Blood Pressure (Diastolic)', unit: 'mmHg', step: '1' },
  { name: 'heartRate' as const,              label: 'Heart Rate',          unit: 'bpm',  step: '1' },
  { name: 'temperature' as const,            label: 'Temperature',         unit: '°C',   step: '0.1' },
  { name: 'fetalHeartRate' as const,         label: 'Fetal Heart Rate',    unit: 'bpm',  step: '1' },
  { name: 'bloodGlucose' as const,           label: 'Blood Glucose',       unit: 'mg/dL',step: '0.1' },
  { name: 'oxygenSaturation' as const,       label: 'Oxygen Saturation',   unit: '%',    step: '1' },
  { name: 'fundalHeight' as const,           label: 'Fundal Height',       unit: 'cm',   step: '0.5' },
  { name: 'hemoglobin' as const,             label: 'Hemoglobin',          unit: 'g/dL', step: '0.1' },
];

export default function NewVitalsPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined && v !== '' && !isNaN(Number(v))));
    try {
      const result = await vitalService.create(cleaned);
      if (result.isAbnormal) {
        toast.error(`Logged — abnormal values detected: ${result.abnormalFlags.join(', ')}`);
      } else {
        toast.success('Vitals logged successfully!');
      }
      router.push('/vitals');
    } catch {
      toast.error('Failed to log vitals. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/vitals" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Vitals</h1>
          <p className="text-gray-500 text-sm mt-0.5">Record your current health metrics</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(({ name, label, unit, step }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="relative">
                  <input {...register(name)} type="number" step={step} placeholder="—"
                    className="w-full px-3 py-2 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea {...register('notes')} rows={3} placeholder="Any observations or comments"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
            {isSubmitting ? 'Saving…' : 'Save Vitals'}
          </button>
        </form>
      </div>
    </div>
  );
}
