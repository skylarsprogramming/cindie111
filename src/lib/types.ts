// User and profile types for type safety

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserProfile {
  uid: string;
  personalInfo: PersonalInfo;
  learningProgress: LearningProgress;
  billingInfo?: BillingInfo;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  language?: string;
  bio?: string;
  profilePicture?: string;
}

export interface LearningProgress {
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  totalLessonsCompleted: number;
  totalStudyTime: number; // in minutes
  skillsProgress: SkillsProgress;
  completedCourses: string[];
  currentCourse?: string;
  streak: number;
  lastActivityAt: string;
}

export interface SkillsProgress {
  reading: number; // 0-100
  writing: number;
  listening: number;
  speaking: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
}

export interface BillingInfo {
  paymentMethods: PaymentMethod[];
  subscription: SubscriptionInfo;
  invoices: Invoice[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface SubscriptionInfo {
  plan: 'free' | 'basic' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  description: string;
  downloadUrl?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  reminders: boolean;
  achievements: boolean;
  newLessons: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  allowMessages: boolean;
}

export interface UpdateProfileRequest {
  personalInfo?: Partial<PersonalInfo>;
  preferences?: Partial<UserPreferences>;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
