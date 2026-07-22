'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  Save,
  Palette,
  Shield,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const SettingsComponent = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    leaveRequests: true,
    meetings: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    showAvatars: true
  });

  const settingSections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAppearanceChange = (key: keyof typeof appearance) => {
    setAppearance(prev => ({
      ...prev,
      [key]: key === 'theme' ? (prev[key] === 'light' ? 'dark' : 'light') : !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings to localStorage
      localStorage.setItem('managerSettings', JSON.stringify({
        notifications,
        appearance
      }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Settings saved successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
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
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Manager Settings</h1>
            <p className="text-[#B8E6EE]">Customize your dashboard notifications and appearance preferences</p>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 flex items-center gap-3 ${
            messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {messageType === 'success' ? <CheckCircle size={20} /> : 
           messageType === 'error' ? <AlertTriangle size={20} /> : 
           <Shield size={20} />}
          <span className="font-medium">{message}</span>
        </motion.div>
      )}

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

              {/* Email Notifications */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Email Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                      <p className="text-xs text-gray-600">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                      <p className="text-xs text-gray-600">Browser notifications</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('push')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Leave Request Alerts</label>
                      <p className="text-xs text-gray-600">Notify for pending requests</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('leaveRequests')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.leaveRequests ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.leaveRequests ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Meeting Reminders</label>
                      <p className="text-xs text-gray-600">Get notified about upcoming meetings</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('meetings')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.meetings ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.meetings ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
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
                <Palette size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
              </div>

              {/* Theme Settings */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  {appearance.theme === 'light' ? (
                    <Sun size={20} className="text-purple-600" />
                  ) : (
                    <Moon size={20} className="text-purple-600" />
                  )}
                  <h3 className="font-semibold text-purple-800">Theme Configuration</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Theme</label>
                      <p className="text-xs text-gray-600">
                        {appearance.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAppearanceChange('theme')}
                      className="flex items-center space-x-2 px-3 py-1 bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors"
                    >
                      <span className="text-sm">Switch</span>
                      {appearance.theme === 'light' ? (
                        <Moon size={14} />
                      ) : (
                        <Sun size={14} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Compact Mode</label>
                      <p className="text-xs text-gray-600">Reduce spacing for more content</p>
                    </div>
                    <button
                      onClick={() => handleAppearanceChange('compactMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        appearance.compactMode ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Show Avatars</label>
                      <p className="text-xs text-gray-600">Display profile pictures</p>
                    </div>
                    <button
                      onClick={() => handleAppearanceChange('showAvatars')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        appearance.showAvatars ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appearance.showAvatars ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#087684] to-[#066466] text-white rounded-xl hover:from-[#066466] hover:to-[#055052] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save size={18} />
          )}
          <span className="font-medium">{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default SettingsComponent;