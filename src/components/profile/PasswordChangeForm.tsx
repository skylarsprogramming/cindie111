'use client';

import { useState } from 'react';
import { getFirebase } from '@/lib/firebaseClient';

export function PasswordChangeForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate passwords
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        throw new Error(passwordErrors.join(', '));
      }

      if (formData.currentPassword === formData.newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Update password using Firebase Auth
      const { auth } = getFirebase();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No user logged in');
      }

      // Note: Firebase doesn't allow server-side password verification
      // We'll use the client-side reauthentication method
      const credential = {
        email: user.email!,
        password: formData.currentPassword
      };

      // Import Firebase Auth functions
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      
      // Reauthenticate user
      const userCredential = EmailAuthProvider.credential(credential.email, credential.password);
      await reauthenticateWithCredential(user, userCredential);
      
      // Update password
      await updatePassword(user, formData.newPassword);

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
    let score = 0;
    
    if (password.length >= 8) score += 20;
    if (/(?=.*[a-z])/.test(password)) score += 20;
    if (/(?=.*[A-Z])/.test(password)) score += 20;
    if (/(?=.*\d)/.test(password)) score += 20;
    if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score += 20;
    
    if (score < 40) return { strength: 'Weak', color: 'bg-red-500', percentage: score };
    if (score < 80) return { strength: 'Medium', color: 'bg-yellow-500', percentage: score };
    return { strength: 'Strong', color: 'bg-green-500', percentage: score };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
        <p className="text-gray-600">Update your password to keep your account secure.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password *
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password *
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? '🙈' : '👁️'}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength.strength === 'Weak' ? 'text-red-600' :
                  passwordStrength.strength === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? '🙈' : '👁️'}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{formData.newPassword.length >= 8 ? '✅' : '❌'}</span>
              At least 8 characters long
            </li>
            <li className={`flex items-center ${/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/(?=.*[a-z])/.test(formData.newPassword) ? '✅' : '❌'}</span>
              One lowercase letter
            </li>
            <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/(?=.*[A-Z])/.test(formData.newPassword) ? '✅' : '❌'}</span>
              One uppercase letter
            </li>
            <li className={`flex items-center ${/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/(?=.*\d)/.test(formData.newPassword) ? '✅' : '❌'}</span>
              One number
            </li>
            <li className={`flex items-center ${/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.newPassword) ? '✅' : '❌'}</span>
              One special character
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || formData.newPassword !== formData.confirmPassword || passwordStrength.strength === 'Weak'}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
