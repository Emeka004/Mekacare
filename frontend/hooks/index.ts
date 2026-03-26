import { useState, useEffect, useCallback } from 'react';
import { appointmentService, vitalService, notificationService, pregnancyService, providerService } from '@/services';
import type { Appointment, VitalSign, Notification, PregnancyProfile } from '@/types';

// ── Generic async hook ─────────────────────────────────────────────────
function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData]       = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, isLoading, error, refetch: execute };
}

// ── Appointments ───────────────────────────────────────────────────────
export function useAppointments(params?: Parameters<typeof appointmentService.getAll>[0]) {
  return useAsync(() => appointmentService.getAll(params), [JSON.stringify(params)]);
}

export function useAppointment(id: string) {
  return useAsync(() => appointmentService.getById(id), [id]);
}

// ── Vitals ─────────────────────────────────────────────────────────────
export function useVitals(params?: Parameters<typeof vitalService.getAll>[0]) {
  return useAsync(() => vitalService.getAll(params), [JSON.stringify(params)]);
}

export function useLatestVital(patientId?: string) {
  return useAsync(() => vitalService.getLatest(patientId), [patientId]);
}

export function useVitalTrends(params?: { weeks?: number; patientId?: string }) {
  return useAsync(() => vitalService.getTrends(params), [JSON.stringify(params)]);
}

// ── Notifications ──────────────────────────────────────────────────────
export function useNotifications() {
  const { data, isLoading, error, refetch } = useAsync(() => notificationService.getAll(), []);

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    refetch();
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    refetch();
  };

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading, error, refetch, markRead, markAllRead,
  };
}

// ── Pregnancy Profile ──────────────────────────────────────────────────
export function useMyPregnancyProfile() {
  return useAsync(() => pregnancyService.getMyProfile(), []);
}

export function usePregnancyProfile(id: string) {
  return useAsync(() => pregnancyService.getById(id), [id]);
}

// ── Provider dashboard ─────────────────────────────────────────────────
export function useProviderDashboard() {
  return useAsync(() => providerService.getDashboard(), []);
}

// ── Paginated helper with local state ─────────────────────────────────
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage]   = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  return { page, limit, setPage, setLimit, nextPage: () => setPage(p => p + 1), prevPage: () => setPage(p => Math.max(1, p - 1)) };
}
