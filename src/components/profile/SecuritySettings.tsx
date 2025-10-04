'use client';

import { useState } from 'react';
import { PasswordChangeForm } from './PasswordChangeForm';

interface SecuritySettingsProps {
  user: any;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [activeSection, setActiveSection] = useState<'password' | 'sessions' | 'twofa' | 'privacy'>('password');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock data for active sessions
  const mockSessions = [
    {
      id: 'session_1',
      device: 'Chrome on Windows',
      location: 'New York, NY, USA',
      lastActive: new Date().toISOString(),
      current: true,
      ipAddress: '192.168.1.1'
    },
    {
      id: 'session_2',
      device: 'Safari on iPhone',
      location: 'New York, NY, USA',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      current: false,
      ipAddress: '192.168.1.2'
    }
  ];

  const revokeSession = async (sessionId: string) => {
    try {
      // In a real app, this would call an API to revoke the session
      console.log('Revoking session:', sessionId);
      setMessage({ type: 'success', text: 'Session revoked successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to revoke session' });
    }
  };

  const revokeAllSessions = async () => {
    try {
      // In a real app, this would call an API to revoke all sessions
      console.log('Revoking all sessions');
      setMessage({ type: 'success', text: 'All sessions revoked successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to revoke sessions' });
    }
  };

  const enableTwoFA = async () => {
    try {
      // In a real app, this would call an API to enable 2FA
      console.log('Enabling 2FA');
      setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable two-factor authentication' });
    }
  };

  const sections = [
    { id: 'password', label: 'Password', icon: '🔐', description: 'Change your password' },
    { id: 'sessions', label: 'Active Sessions', icon: '📱', description: 'Manage your active sessions' },
    { id: 'twofa', label: 'Two-Factor Auth', icon: '🔑', description: 'Add an extra layer of security' },
    { id: 'privacy', label: 'Privacy Settings', icon: '🛡️', description: 'Control your privacy preferences' },
  ] as const;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
        <p className="text-gray-600">Manage your account security and privacy settings.</p>
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

      {/* Section Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div>
        {activeSection === 'password' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Password Security</h3>
              <p className="text-gray-600">Keep your account secure with a strong password.</p>
            </div>
            <PasswordChangeForm />
          </div>
        )}

        {activeSection === 'sessions' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <p className="text-gray-600">Manage devices that are currently signed into your account.</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {mockSessions.map((session) => (
                <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600">
                          {session.device.includes('iPhone') ? '📱' : '💻'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{session.device}</p>
                          {session.current && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {session.location} • {session.ipAddress}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last active: {formatDate(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="mt-1 text-sm text-yellow-700">
                    If you see any suspicious activity or unrecognized sessions, revoke them immediately and change your password.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={revokeAllSessions}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              >
                Sign out of all devices
              </button>
            </div>
          </div>
        )}

        {activeSection === 'twofa' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-gray-600">Add an extra layer of security to your account.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Authenticator App</h4>
                  <p className="text-sm text-gray-600">
                    Use an authenticator app like Google Authenticator or Authy
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Disabled
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600">📱</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Google Authenticator</p>
                    <p className="text-sm text-gray-600">Free authenticator app</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600">🔐</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Authy</p>
                    <p className="text-sm text-gray-600">Cross-platform authenticator</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={enableTwoFA}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-600 text-lg">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">How it works</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    When you sign in, you'll be asked for your password plus a code from your authenticator app. 
                    This makes your account much more secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
              <p className="text-gray-600">Control how your information is shared and used.</p>
            </div>

            <div className="space-y-6">
              {/* Profile Visibility */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Profile Visibility</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="public"
                      className="mr-3"
                      defaultChecked
                    />
                    <div>
                      <p className="font-medium text-gray-900">Public</p>
                      <p className="text-sm text-gray-600">Anyone can see your profile and progress</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="friends"
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Friends Only</p>
                      <p className="text-sm text-gray-600">Only people you connect with can see your profile</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="private"
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Private</p>
                      <p className="text-sm text-gray-600">Only you can see your profile and progress</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Data Sharing</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Share progress with friends</p>
                      <p className="text-sm text-gray-600">Allow friends to see your learning progress</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Allow direct messages</p>
                      <p className="text-sm text-gray-600">Let other users send you messages</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Analytics and improvement</p>
                      <p className="text-sm text-gray-600">Help us improve by sharing anonymous usage data</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <p className="font-medium text-gray-900">Export my data</p>
                    <p className="text-sm text-gray-600">Download a copy of all your data</p>
                  </button>
                  
                  <button className="w-full text-left px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                    <p className="font-medium">Delete my account</p>
                    <p className="text-sm">Permanently delete your account and all data</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
