'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services';
import { User, Lock } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  phone:     z.string().optional(),
});
type ProfileData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
  confirm:         z.string(),
}).refine(d => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  });

  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (data: ProfileData) => {
    if (!user) return;
    try {
      await userService.update(user.id, data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  const savePassword = async (data: PasswordData) => {
    if (!user) return;
    try {
      await userService.changePassword(user.id, data.currentPassword, data.newPassword);
      toast.success('Password changed!');
      passwordForm.reset();
    } catch {
      toast.error('Incorrect current password.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {(['profile', 'password'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-pink-500" />
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
          </div>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input {...profileForm.register('firstName')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
                {profileForm.formState.errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input {...profileForm.register('lastName')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
                {profileForm.formState.errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input {...profileForm.register('phone')} type="tel"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input value={user?.email ?? ''} disabled
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400" />
            </div>
            <button type="submit" disabled={profileForm.formState.isSubmitting}
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-pink-500" />
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">
            {(['currentPassword', 'newPassword', 'confirm'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field === 'currentPassword' ? 'Current password' : field === 'newPassword' ? 'New password' : 'Confirm new password'}
                </label>
                <input {...passwordForm.register(field)} type="password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
                {passwordForm.formState.errors[field] && (
                  <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors[field]?.message}</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={passwordForm.formState.isSubmitting}
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
