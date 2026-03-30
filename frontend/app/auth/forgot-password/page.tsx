'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { Baby, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-1 text-sm">We&apos;ll send a reset link to your email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-semibold text-sm">Reset link sent!</p>
              <p className="text-gray-500 text-sm mt-2">Check your inbox and follow the instructions to reset your password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-pink-500 font-medium hover:text-pink-700 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
