'use client';

import { useState } from 'react';
import { UserProfile, UserPreferences } from '@/lib/types';

interface PreferencesFormProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserPreferences>) => void;
}

export function PreferencesForm({ profile, onUpdate }: PreferencesFormProps) {
  const [formData, setFormData] = useState<UserPreferences>(profile.preferences);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await onUpdate(formData);
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: keyof typeof formData.notifications, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: keyof typeof formData.privacy, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
        <p className="text-gray-600">Customize your experience and notification settings.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Theme Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: '☀️', description: 'Light theme' },
                  { value: 'dark', label: 'Dark', icon: '🌙', description: 'Dark theme' },
                  { value: 'auto', label: 'Auto', icon: '🔄', description: 'Follow system' },
                ].map((theme) => (
                  <label
                    key={theme.value}
                    className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.theme === theme.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={formData.theme === theme.value}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-2">{theme.icon}</span>
                    <span className="font-medium text-gray-900">{theme.label}</span>
                    <span className="text-xs text-gray-600 text-center">{theme.description}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Interface Language
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="ru">Русский</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
                <option value="ar">العربية</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
              { key: 'reminders', label: 'Study Reminders', description: 'Get reminded to study regularly' },
              { key: 'achievements', label: 'Achievement Notifications', description: 'Get notified when you earn achievements' },
              { key: 'newLessons', label: 'New Lesson Notifications', description: 'Get notified about new lessons and courses' },
            ].map((notification) => (
              <label key={notification.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{notification.label}</p>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications[notification.key as keyof typeof formData.notifications]}
                  onChange={(e) => handleNotificationChange(
                    notification.key as keyof typeof formData.notifications, 
                    e.target.checked
                  )}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
                  { value: 'friends', label: 'Friends Only', description: 'Only connected users can see your profile' },
                  { value: 'private', label: 'Private', description: 'Only you can see your profile' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option.value}
                      checked={formData.privacy.profileVisibility === option.value}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Learning Progress</p>
                  <p className="text-sm text-gray-600">Allow others to see your learning progress</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.privacy.showProgress}
                  onChange={(e) => handlePrivacyChange('showProgress', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow Messages</p>
                  <p className="text-sm text-gray-600">Let other users send you direct messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.privacy.allowMessages}
                  onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Difficulty Level
              </label>
              <select
                id="difficulty"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="adaptive">Adaptive (Recommended)</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="studyTime" className="block text-sm font-medium text-gray-700 mb-2">
                Daily Study Goal (minutes)
              </label>
              <input
                type="number"
                id="studyTime"
                min="5"
                max="180"
                defaultValue="30"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-2">
                Study Reminder Time
              </label>
              <input
                type="time"
                id="reminderTime"
                defaultValue="19:00"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">High Contrast Mode</p>
                <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Large Text</p>
                <p className="text-sm text-gray-600">Use larger text throughout the interface</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Screen Reader Support</p>
                <p className="text-sm text-gray-600">Optimize for screen readers</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
