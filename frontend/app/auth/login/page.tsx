'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginPayload } from '@/types';
import { Eye, EyeOff, Baby } from 'lucide-react';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data as unknown as LoginPayload);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to PregnancyCare</h1>
          <p className="text-gray-500 mt-1 text-sm">Supporting every step of your journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-pink-500 hover:text-pink-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>Demo credentials</p>
            <p className="text-xs mt-1">Patient: <span className="font-mono text-pink-600">chioma@example.com / Patient@1234</span></p>
            <p className="text-xs">Provider: <span className="font-mono text-pink-600">dr.amara@pregnancyhealth.com / Provider@1234</span></p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-pink-500 font-medium hover:text-pink-700">Create account</Link>
        </p>
      </div>
    </div>
  );
}
