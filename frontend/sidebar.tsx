'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Calendar, Users, FileWarning,
  Activity, BookOpen, Bell, Settings, LogOut,
  Baby, Stethoscope, ShieldCheck,
} from 'lucide-react';

const patientNav = [
  { href: '/dashboard',         label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/appointments',      label: 'Appointments',   icon: Calendar },
  { href: '/vitals',            label: 'Vitals',         icon: Activity },
  { href: '/risks',             label: 'Report Risk',    icon: FileWarning },
  { href: '/education',         label: 'Education',      icon: BookOpen },
  { href: '/providers',         label: 'Find Provider',  icon: Stethoscope },
  { href: '/notifications',     label: 'Notifications',  icon: Bell },
];

const providerNav = [
  { href: '/dashboard/provider', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/appointments',       label: 'Appointments', icon: Calendar },
  { href: '/patients',           label: 'My Patients',  icon: Baby },
  { href: '/risks',              label: 'Risk Reports', icon: FileWarning },
  { href: '/vitals',             label: 'Vitals',       icon: Activity },
  { href: '/education',          label: 'Education',    icon: BookOpen },
  { href: '/notifications',      label: 'Notifications',icon: Bell },
];

const adminNav = [
  { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/users',        label: 'Users',        icon: Users },
  { href: '/admin/providers',    label: 'Providers',    icon: Stethoscope },
  { href: '/admin/risks',        label: 'Risk Reports', icon: FileWarning },
  { href: '/admin/education',    label: 'Education',    icon: BookOpen },
  { href: '/admin/notifications',label: 'Broadcast',    icon: Bell },
  { href: '/admin/settings',     label: 'Settings',     icon: ShieldCheck },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'provider' ? providerNav : patientNav;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
            <Baby className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">PregnancyCare</span>
        </div>
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-pink-50">
          <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-pink-600 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-pink-500' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
