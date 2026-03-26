// ── Users ──────────────────────────────────────────────────────────────
export type UserRole = 'patient' | 'provider' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  pregnancyProfile?: PregnancyProfile;
  providerProfile?: ProviderProfile;
}

// ── Auth ───────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  firstName: string; lastName: string;
  email: string; password: string;
  role?: UserRole; phone?: string;
}

// ── Pregnancy Profile ──────────────────────────────────────────────────
export interface PregnancyProfile {
  id: string;
  userId: string;
  primaryProviderId?: string;
  lastMenstrualPeriod?: string;
  estimatedDueDate?: string;
  gravidaPara?: string;
  bloodType?: string;
  prePregnancyWeight?: number;
  currentWeight?: number;
  height?: number;
  isHighRisk: boolean;
  riskFactors: string[];
  medicalHistory: Record<string, unknown>;
  allergies: string[];
  medications: Array<{ name: string; dose: string; frequency: string }>;
  deliveryPlan: Record<string, unknown>;
  status: 'active' | 'delivered' | 'transferred' | 'inactive';
  gestationalAge?: number;
  trimester?: 1 | 2 | 3;
}

// ── Provider Profile ───────────────────────────────────────────────────
export type Specialty = 'obstetrician' | 'gynecologist' | 'midwife' | 'perinatologist' | 'nurse_practitioner' | 'general_practitioner';

export interface ProviderProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  specialty: Specialty;
  yearsOfExperience?: number;
  hospital?: string;
  clinicAddress?: string;
  bio?: string;
  education: Array<{ degree: string; institution: string; year: number }>;
  certifications: string[];
  languages: string[];
  consultationFee?: number;
  acceptingPatients: boolean;
  rating: number;
  reviewCount: number;
  availableSlots: Record<string, string[]>;
  isVerified: boolean;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'email'>;
}

// ── Appointments ───────────────────────────────────────────────────────
export type AppointmentType = 'prenatal_checkup' | 'ultrasound' | 'blood_test' | 'consultation' | 'emergency' | 'postpartum' | 'virtual';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  scheduledAt: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  reason?: string;
  notes?: string;
  diagnosis?: string;
  prescription: Array<{ drug: string; dose: string; frequency: string }>;
  followUpDate?: string;
  patient?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
  provider?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

// ── Risk Reports ───────────────────────────────────────────────────────
export type RiskCategory = 'bleeding' | 'hypertension' | 'gestational_diabetes' | 'preeclampsia' | 'preterm_labor' | 'infection' | 'fetal_movement' | 'other';
export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type RiskStatus = 'open' | 'under_review' | 'resolved' | 'escalated';

export interface RiskReport {
  id: string;
  patientId: string;
  reportedBy: string;
  reviewedBy?: string;
  category: RiskCategory;
  severity: RiskSeverity;
  status: RiskStatus;
  title: string;
  description: string;
  symptoms: string[];
  vitalsAtReport?: Record<string, number>;
  actionTaken?: string;
  resolution?: string;
  resolvedAt?: string;
  requiresEmergency: boolean;
  createdAt: string;
  patient?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

// ── Vital Signs ────────────────────────────────────────────────────────
export interface VitalSign {
  id: string;
  patientId: string;
  recordedBy?: string;
  recordedAt: string;
  weight?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  fetalHeartRate?: number;
  bloodGlucose?: number;
  oxygenSaturation?: number;
  fundalHeight?: number;
  urineProtein?: 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+';
  hemoglobin?: number;
  gestationalWeekAtReading?: number;
  notes?: string;
  isAbnormal: boolean;
  abnormalFlags: string[];
}

// ── Education ──────────────────────────────────────────────────────────
export type ContentCategory = 'nutrition' | 'exercise' | 'mental_health' | 'labor_delivery' | 'postpartum' | 'fetal_development' | 'medication_safety' | 'warning_signs' | 'general';

export interface EducationContent {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category: ContentCategory;
  type: 'article' | 'video' | 'infographic' | 'checklist' | 'faq';
  trimesterTarget: number[];
  tags: string[];
  coverImage?: string;
  videoUrl?: string;
  readTimeMinutes?: number;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  isFeatured: boolean;
  author?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

// ── Notifications ──────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
}

// ── API Responses ──────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
