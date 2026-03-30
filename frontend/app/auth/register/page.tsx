'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { RegisterPayload } from '@/types';
import { Baby } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName:  z.string().min(2, 'Last name required'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role:      z.enum(['patient', 'provider']),
  phone:     z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister(data as unknown as RegisterPayload);
      toast.success('Account created! Welcome to PregnancyCare.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join thousands of mothers supported by PregnancyCare</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {(['patient', 'provider'] as const).map(role => (
                  <label key={role} className="cursor-pointer">
                    <input {...register('role')} type="radio" value={role} className="sr-only peer" />
                    <div className="py-2 text-center border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 peer-checked:border-pink-400 peer-checked:text-pink-600 peer-checked:bg-pink-50 transition-all capitalize">
                      {role}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First name</label>
                <input {...register('firstName')} placeholder="Chioma" className={inputClass} />
                {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input {...register('lastName')} placeholder="Osei" className={inputClass} />
                {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Phone (optional)</label>
              <input {...register('phone')} type="tel" placeholder="+234 800 000 0000" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input {...register('password')} type="password" placeholder="Min. 8 characters" className={inputClass} />
              {errors.password && <p className={errorClass}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors mt-2"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-pink-500 font-medium hover:text-pink-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
