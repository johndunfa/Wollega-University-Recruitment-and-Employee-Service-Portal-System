'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Save, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  User
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reportReminders: boolean;
  leaveUpdates: boolean;
}

interface AppearanceSettings {
  darkMode: boolean;
  language: string;
  timezone: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('security');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    reportReminders: true,
    leaveUpdates: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    darkMode: false,
    language: 'en',
    timezone: 'UTC+0',
  });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setMessage('Password changed successfully! Please log in again with your new password.');
        setMessageType('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const { message } = await res.json();
        setMessage(message || 'Error changing password.');
        setMessageType('error');
      }
    } catch (error) {
      console.error(error);
      setMessage('Server error. Please try again later.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setMessage('Notification preferences updated successfully.');
    setMessageType('success');
  };

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }));
    setMessage('Appearance settings updated successfully.');
    setMessageType('success');
  };

  const settingSections = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'account', label: 'Account', icon: User },
  ];

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const renderPasswordStrength = () => {
    const score = passwordStrength(newPassword);
    const width = (score / 5) * 100;
    
    return newPassword ? (
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Password strength:</span>
          <span className={`font-medium ${
            score <= 2 ? 'text-red-600' : 
            score <= 3 ? 'text-yellow-600' : 
            score <= 4 ? 'text-blue-600' : 'text-green-600'
          }`}>
            {getPasswordStrengthLabel(score)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(score)}`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    ) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#087684] to-[#066466] rounded-xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <SettingsIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings & Preferences</h1>
            <p className="text-[#B8E6EE]">Customize your account and security settings</p>
          </div>
        </div>
      </div>

      {/* Settings Navigation and Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          {settingSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeSection === section.id
                  ? 'text-[#087684] border-b-2 border-[#087684]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <section.icon size={20} />
              {section.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={20} className="text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Password Requirements</h3>
                </div>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>

      <div className="space-y-4">
        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
          <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                      placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
        </div>

        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
          <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                      placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {renderPasswordStrength()}
        </div>

        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
          <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                      placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
        </div>

        <button
          onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-[#087684] text-white py-3 px-6 rounded-lg hover:bg-[#066466] disabled:bg-[#6B7280] transition-colors font-semibold flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bell size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', icon: Mail, label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'pushNotifications', icon: Smartphone, label: 'Push Notifications', description: 'Receive browser push notifications' },
                  { key: 'reportReminders', icon: Bell, label: 'Report Reminders', description: 'Get reminded about pending reports' },
                  { key: 'leaveUpdates', icon: CheckCircle, label: 'Leave Updates', description: 'Notifications about leave request status' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                        <item.icon size={20} className="text-[#087684]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(item.key as keyof NotificationSettings)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[item.key as keyof NotificationSettings] ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[item.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Moon size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">Appearance & Localization</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                        {appearance.darkMode ? <Moon size={20} className="text-[#087684]" /> : <Sun size={20} className="text-[#087684]" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Dark Mode</h3>
                        <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAppearanceChange('darkMode', !appearance.darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        appearance.darkMode ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appearance.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                      <Globe size={20} className="text-[#087684]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Language</h3>
                      <p className="text-sm text-gray-600">Select your preferred language</p>
                    </div>
                  </div>
                  <select
                    value={appearance.language}
                    onChange={(e) => handleAppearanceChange('language', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                      <Globe size={20} className="text-[#087684]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Timezone</h3>
                      <p className="text-sm text-gray-600">Set your local timezone</p>
                    </div>
                  </div>
                  <select
                    value={appearance.timezone}
                    onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                  >
                    <option value="UTC+0">UTC+0 (London)</option>
                    <option value="UTC+1">UTC+1 (Berlin)</option>
                    <option value="UTC+3">UTC+3 (Moscow)</option>
                    <option value="UTC+5:30">UTC+5:30 (Delhi)</option>
                    <option value="UTC+8">UTC+8 (Singapore)</option>
                    <option value="UTC-5">UTC-5 (New York)</option>
                    <option value="UTC-8">UTC-8 (Los Angeles)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <User size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Account Management</h3>
                </div>
                <p className="text-blue-700 mb-4">
                  For account information changes, profile updates, or account deletion requests, please contact your HR department or system administrator.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Contact HR
                  </button>
                  <button className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                    Download Data
        </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : messageType === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              {messageType === 'success' && <CheckCircle size={20} />}
              {messageType === 'error' && <AlertCircle size={20} />}
              {messageType === 'info' && <AlertCircle size={20} />}
              <p className="font-medium">{message}</p>
            </motion.div>
          )}
      </div>
    </div>
    </motion.div>
  );
};

export default Settings;
