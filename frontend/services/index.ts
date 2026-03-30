import api from '@/lib/api';
import type {
  LoginPayload, RegisterPayload, User,
  Appointment, AppointmentType,
  RiskReport, RiskCategory, RiskSeverity,
  VitalSign,
  EducationContent, ContentCategory,
  Notification,
  ProviderProfile, Specialty,
  PregnancyProfile,
  PaginatedResponse, ApiResponse,
} from '@/types';

// ══════════════════════════════════════════════════════════════════════
//  AUTH SERVICE
// ══════════════════════════════════════════════════════════════════════
export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', payload).then(r => r.data),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', payload).then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then(r => r.data),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me').then(r => r.data.data.user),
};

// ══════════════════════════════════════════════════════════════════════
//  PREGNANCY SERVICE
// ══════════════════════════════════════════════════════════════════════
export const pregnancyService = {
  createProfile: (data: Partial<PregnancyProfile>) =>
    api.post<ApiResponse<{ profile: PregnancyProfile }>>('/pregnancy-profiles', data).then(r => r.data.data.profile),

  getMyProfile: () =>
    api.get<ApiResponse<{ profile: PregnancyProfile; gestationalAge: number; trimester: number }>>('/pregnancy-profiles/me').then(r => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ profile: PregnancyProfile }>>(`/pregnancy-profiles/${id}`).then(r => r.data.data.profile),

  getAll: (params?: { page?: number; limit?: number; isHighRisk?: boolean; status?: string }) =>
    api.get<PaginatedResponse<PregnancyProfile>>('/pregnancy-profiles', { params }).then(r => r.data),

  update: (id: string, data: Partial<PregnancyProfile>) =>
    api.put<ApiResponse<{ profile: PregnancyProfile }>>(`/pregnancy-profiles/${id}`, data).then(r => r.data.data.profile),

  getSummary: (id: string) =>
    api.get<ApiResponse<{ profile: PregnancyProfile; gestationalAge: number; trimester: number; latestVitals: VitalSign | null; upcomingAppointments: number }>>(`/pregnancy-profiles/${id}/summary`).then(r => r.data.data),
};

// ══════════════════════════════════════════════════════════════════════
//  PROVIDER SERVICE
// ══════════════════════════════════════════════════════════════════════
export const providerService = {
  getAll: (params?: { page?: number; limit?: number; specialty?: Specialty; acceptingPatients?: boolean; search?: string }) =>
    api.get<PaginatedResponse<ProviderProfile>>('/providers', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ profile: ProviderProfile }>>(`/providers/${id}`).then(r => r.data.data.profile),

  createProfile: (data: Partial<ProviderProfile>) =>
    api.post<ApiResponse<{ profile: ProviderProfile }>>('/providers/profile', data).then(r => r.data.data.profile),

  updateProfile: (data: Partial<ProviderProfile>) =>
    api.put<ApiResponse<{ profile: ProviderProfile }>>('/providers/profile', data).then(r => r.data.data.profile),

  getDashboard: () =>
    api.get<ApiResponse<{
      stats: { totalPatients: number; todayAppointments: number; pendingReports: number; highRiskPatients: number };
      upcomingAppointments: Appointment[];
      recentRiskReports: RiskReport[];
    }>>('/providers/dashboard').then(r => r.data.data),

  getPatients: (params?: { page?: number; limit?: number; isHighRisk?: boolean }) =>
    api.get<PaginatedResponse<PregnancyProfile>>('/providers/patients', { params }).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════
//  APPOINTMENT SERVICE
// ══════════════════════════════════════════════════════════════════════
export interface CreateAppointmentDto {
  providerId: string;
  scheduledAt: string;
  type: AppointmentType;
  duration?: number;
  reason?: string;
  isVirtual?: boolean;
  location?: string;
  patientId?: string;
}

export const appointmentService = {
  create: (data: CreateAppointmentDto) =>
    api.post<ApiResponse<{ appointment: Appointment }>>('/appointments', data).then(r => r.data.data.appointment),

  getAll: (params?: { page?: number; limit?: number; status?: string; type?: string; from?: string; to?: string }) =>
    api.get<PaginatedResponse<Appointment>>('/appointments', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ appointment: Appointment }>>(`/appointments/${id}`).then(r => r.data.data.appointment),

  update: (id: string, data: Partial<Appointment>) =>
    api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${id}`, data).then(r => r.data.data.appointment),

  updateStatus: (id: string, status: string, cancelReason?: string) =>
    api.patch<ApiResponse<{ appointment: Appointment }>>(`/appointments/${id}/status`, { status, cancelReason }).then(r => r.data.data.appointment),

  delete: (id: string) =>
    api.delete(`/appointments/${id}`).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════
//  RISK SERVICE
// ══════════════════════════════════════════════════════════════════════
export interface CreateRiskDto {
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
  symptoms?: string[];
  vitalsAtReport?: Record<string, number>;
  requiresEmergency?: boolean;
  patientId?: string;
}

export const riskService = {
  create: (data: CreateRiskDto) =>
    api.post<ApiResponse<{ report: RiskReport }>>('/risks', data).then(r => r.data.data.report),

  getAll: (params?: { page?: number; limit?: number; severity?: RiskSeverity; status?: string; category?: RiskCategory }) =>
    api.get<PaginatedResponse<RiskReport>>('/risks', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ report: RiskReport }>>(`/risks/${id}`).then(r => r.data.data.report),

  update: (id: string, data: Partial<RiskReport>) =>
    api.put<ApiResponse<{ report: RiskReport }>>(`/risks/${id}`, data).then(r => r.data.data.report),

  review: (id: string, payload: { status: string; actionTaken?: string; resolution?: string }) =>
    api.patch<ApiResponse<{ report: RiskReport }>>(`/risks/${id}/review`, payload).then(r => r.data.data.report),

  delete: (id: string) =>
    api.delete(`/risks/${id}`).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════
//  VITAL SIGN SERVICE
// ══════════════════════════════════════════════════════════════════════
export const vitalService = {
  create: (data: Partial<VitalSign>) =>
    api.post<ApiResponse<{ vital: VitalSign; isAbnormal: boolean; abnormalFlags: string[] }>>('/vitals', data).then(r => r.data.data),

  getAll: (params?: { page?: number; limit?: number; from?: string; to?: string; isAbnormal?: boolean; patientId?: string }) =>
    api.get<PaginatedResponse<VitalSign>>('/vitals', { params }).then(r => r.data),

  getLatest: (patientId?: string) =>
    api.get<ApiResponse<{ vital: VitalSign }>>('/vitals/latest', { params: { patientId } }).then(r => r.data.data.vital),

  getTrends: (params?: { weeks?: number; patientId?: string }) =>
    api.get<ApiResponse<{ trends: VitalSign[]; dataPoints: number }>>('/vitals/trends', { params }).then(r => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ vital: VitalSign }>>(`/vitals/${id}`).then(r => r.data.data.vital),

  update: (id: string, data: Partial<VitalSign>) =>
    api.put<ApiResponse<{ vital: VitalSign }>>(`/vitals/${id}`, data).then(r => r.data.data.vital),

  delete: (id: string) =>
    api.delete(`/vitals/${id}`).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════
//  EDUCATION SERVICE
// ══════════════════════════════════════════════════════════════════════
export const educationService = {
  getAll: (params?: { page?: number; limit?: number; category?: ContentCategory; type?: string; trimester?: number; featured?: boolean; search?: string }) =>
    api.get<PaginatedResponse<EducationContent>>('/education', { params }).then(r => r.data),

  getOne: (idOrSlug: string) =>
    api.get<ApiResponse<{ content: EducationContent }>>(`/education/${idOrSlug}`).then(r => r.data.data.content),

  create: (data: Partial<EducationContent>) =>
    api.post<ApiResponse<{ content: EducationContent }>>('/education', data).then(r => r.data.data.content),

  update: (id: string, data: Partial<EducationContent>) =>
    api.put<ApiResponse<{ content: EducationContent }>>(`/education/${id}`, data).then(r => r.data.data.content),

  like: (id: string) =>
    api.post<ApiResponse<{ likeCount: number }>>(`/education/${id}/like`).then(r => r.data.data),

  delete: (id: string) =>
    api.delete(`/education/${id}`).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════
//  NOTIFICATION SERVICE
// ══════════════════════════════════════════════════════════════════════
export const notificationService = {
  getAll: (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) =>
    api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number; total: number }>>('/notifications', { params }).then(r => r.data.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then(r => r.data),

  delete: (id: string) =>
    api.delete(`/notifications/${id}`).then(r => r.data),

  clearRead: () =>
    api.delete('/notifications').then(r => r.data),

  broadcast: (payload: { title: string; message: string; type?: string; priority?: string; roleTarget?: string }) =>
    api.post('/notifications/broadcast', payload).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════════
//  USER SERVICE
// ══════════════════════════════════════════════════════════════════════
export const userService = {
  getAll: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ user: User }>>(`/users/${id}`).then(r => r.data.data.user),

  update: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<{ user: User }>>(`/users/${id}`, data).then(r => r.data.data.user),

  changePassword: (id: string, currentPassword: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { currentPassword, newPassword }).then(r => r.data),

  deactivate: (id: string) =>
    api.delete(`/users/${id}`).then(r => r.data),

  getStats: () =>
    api.get<ApiResponse<{ totalUsers: number; patients: number; providers: number; activePatients: number }>>('/users/stats').then(r => r.data.data),
};
