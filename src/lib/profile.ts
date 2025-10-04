import { UserProfile, PersonalInfo, LearningProgress, SkillsProgress, BillingInfo, UserPreferences } from './types';

// Default profile creation
export function createDefaultProfile(uid: string, email: string, displayName?: string): UserProfile {
  const now = new Date().toISOString();
  
  return {
    uid,
    personalInfo: {
      firstName: displayName?.split(' ')[0] || '',
      lastName: displayName?.split(' ').slice(1).join(' ') || '',
      displayName: displayName || '',
      email,
      country: '',
      language: 'en',
      bio: ''
    },
    learningProgress: {
      currentLevel: 'beginner',
      totalLessonsCompleted: 0,
      totalStudyTime: 0,
      skillsProgress: {
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
        pronunciation: 0,
        grammar: 0,
        vocabulary: 0
      },
      completedCourses: [],
      streak: 0,
      lastActivityAt: now
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        reminders: true,
        achievements: true,
        newLessons: true
      },
      privacy: {
        profileVisibility: 'private',
        showProgress: false,
        allowMessages: false
      }
    },
    createdAt: now,
    updatedAt: now
  };
}

// Profile validation
export function validatePersonalInfo(info: Partial<PersonalInfo>): string[] {
  const errors: string[] = [];
  
  if (info.firstName && info.firstName.length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  
  if (info.lastName && info.lastName.length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  
  if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
    errors.push('Invalid email format');
  }
  
  if (info.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(info.phoneNumber)) {
    errors.push('Invalid phone number format');
  }
  
  if (info.bio && info.bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }
  
  return errors;
}

// Skills progress calculation
export function calculateOverallProgress(skillsProgress: SkillsProgress): number {
  const skills = Object.values(skillsProgress);
  return Math.round(skills.reduce((sum, skill) => sum + skill, 0) / skills.length);
}

// Level determination based on progress
export function determineLevel(overallProgress: number): 'beginner' | 'intermediate' | 'advanced' {
  if (overallProgress < 30) return 'beginner';
  if (overallProgress < 70) return 'intermediate';
  return 'advanced';
}

// Profile sanitization for public display
export function sanitizeProfileForPublic(profile: UserProfile) {
  return {
    uid: profile.uid,
    personalInfo: {
      displayName: profile.personalInfo.displayName,
      country: profile.personalInfo.country,
      language: profile.personalInfo.language,
      bio: profile.personalInfo.bio
    },
    learningProgress: {
      currentLevel: profile.learningProgress.currentLevel,
      totalLessonsCompleted: profile.learningProgress.totalLessonsCompleted,
      totalStudyTime: profile.learningProgress.totalStudyTime,
      streak: profile.learningProgress.streak
    },
    createdAt: profile.createdAt
  };
}

// Profile update helpers
export function updatePersonalInfo(current: PersonalInfo, updates: Partial<PersonalInfo>): PersonalInfo {
  return {
    ...current,
    ...updates,
    displayName: updates.displayName || `${updates.firstName || current.firstName} ${updates.lastName || current.lastName}`.trim()
  };
}

export function updateSkillsProgress(current: SkillsProgress, updates: Partial<SkillsProgress>): SkillsProgress {
  return {
    ...current,
    ...updates
  };
}

export function updateLearningProgress(current: LearningProgress, updates: Partial<LearningProgress>): LearningProgress {
  const updated = {
    ...current,
    ...updates,
    lastActivityAt: new Date().toISOString()
  };
  
  // Recalculate level based on overall progress
  const overallProgress = calculateOverallProgress(updated.skillsProgress);
  updated.currentLevel = determineLevel(overallProgress);
  
  return updated;
}
