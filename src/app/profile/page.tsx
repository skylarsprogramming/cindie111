'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebase } from '@/lib/firebaseClient';
import { UserProfile, PersonalInfo, UserPreferences } from '@/lib/types';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { PreferencesForm } from '@/components/profile/PreferencesForm';
import { BillingSection } from '@/components/profile/BillingSection';
import { LearningDashboard } from '@/components/profile/LearningDashboard';
import { SecuritySettings } from '@/components/profile/SecuritySettings';

type TabType = 'personal' | 'learning' | 'billing' | 'security' | 'preferences';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { auth } = getFirebase();
    
    // Check authentication
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }
      
      setUser(firebaseUser);
      await loadProfile(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadProfile = async (uid: string) => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<PersonalInfo> | Partial<UserPreferences>) => {
    if (!user || !profile) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'learning', label: 'Learning Dashboard', icon: '📚' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">📝</div>
          <p className="text-gray-600">No profile found. Creating one for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.personalInfo.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.personalInfo.displayName || 'User Profile'}
                </h1>
                <p className="text-gray-600">{profile.personalInfo.email}</p>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    profile.learningProgress.currentLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                    profile.learningProgress.currentLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {profile.learningProgress.currentLevel.charAt(0).toUpperCase() + profile.learningProgress.currentLevel.slice(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {profile.learningProgress.totalLessonsCompleted} lessons completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                {activeTab === 'personal' && (
                  <PersonalInfoForm 
                    profile={profile} 
                    onUpdate={(updates) => updateProfile({ personalInfo: updates })} 
                  />
                )}
                
                {activeTab === 'learning' && (
                  <LearningDashboard profile={profile} />
                )}
                
                {activeTab === 'billing' && (
                  <BillingSection profile={profile} />
                )}
                
                {activeTab === 'security' && (
                  <SecuritySettings user={user} />
                )}
                
                {activeTab === 'preferences' && (
                  <PreferencesForm 
                    profile={profile} 
                    onUpdate={(updates) => updateProfile({ preferences: updates })} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
