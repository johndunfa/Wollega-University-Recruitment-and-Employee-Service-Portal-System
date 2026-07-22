'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Users, 
  Server, 
  Bell, 
  Lock,
  AlertTriangle,
  CheckCircle,
  Globe,
  Database,
  Activity,
  Mail
} from 'lucide-react';

interface SecuritySettings {
  requireUppercase: boolean;
  requireNumbers: boolean;
  enable2FA: boolean;
  adminOnly2FA: boolean;
  ipWhitelist: boolean;
  sessionTimeout: number;
  concurrentSessions: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  autoBackup: boolean;
  emailNotifications: boolean;
  auditLogging: boolean;
}

const AdminSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('security');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireUppercase: true,
    requireNumbers: true,
    enable2FA: false,
    adminOnly2FA: true,
    ipWhitelist: false,
    sessionTimeout: 120,
    concurrentSessions: 3
  });

  // System Settings State  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    auditLogging: true
  });

  const settingSections = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Server },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Toggle handler for security settings
  const toggleSecuritySetting = (setting: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Toggle handler for system settings
  const toggleSystemSetting = (setting: keyof SystemSettings) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
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
            <SettingsIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
            <p className="text-[#B8E6EE]">Configure system security, user management, and operational settings</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Security Configuration</h2>
              </div>

              {/* Password Policy */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock size={20} className="text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Password Policy</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Require Uppercase Letters</label>
                      <p className="text-xs text-gray-600">Passwords must contain uppercase letters</p>
                    </div>
                    <button
                      onClick={() => toggleSecuritySetting('requireUppercase')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.requireUppercase ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.requireUppercase ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Require Numbers</label>
                      <p className="text-xs text-gray-600">Passwords must contain numeric characters</p>
                    </div>
                    <button
                      onClick={() => toggleSecuritySetting('requireNumbers')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.requireNumbers ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.requireNumbers ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Two-Factor Authentication</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Enable 2FA</label>
                      <p className="text-xs text-gray-600">Require two-factor authentication for all users</p>
                    </div>
                    <button
                      onClick={() => toggleSecuritySetting('enable2FA')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.enable2FA ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.enable2FA ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Admin-Only 2FA</label>
                      <p className="text-xs text-gray-600">Require 2FA only for admin accounts</p>
                    </div>
                    <button
                      onClick={() => toggleSecuritySetting('adminOnly2FA')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.adminOnly2FA ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.adminOnly2FA ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Session Management */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Session Management</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Session Timeout (minutes)</label>
                      <p className="text-xs text-gray-600">Automatically log out inactive users</p>
                    </div>
                    <input 
                      type="number" 
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 120 }))}
                      min="15" 
                      max="480"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Concurrent Sessions</label>
                      <p className="text-xs text-gray-600">Limit simultaneous logins per user</p>
                    </div>
                    <input 
                      type="number" 
                      value={securitySettings.concurrentSessions}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, concurrentSessions: parseInt(e.target.value) || 3 }))}
                      min="1" 
                      max="10"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent" 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">IP Whitelist</label>
                      <p className="text-xs text-gray-600">Restrict access to specific IP addresses</p>
                    </div>
                    <button
                      onClick={() => toggleSecuritySetting('ipWhitelist')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.ipWhitelist ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings.ipWhitelist ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Section */}
          {activeSection === 'system' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Server size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                        <AlertTriangle size={20} className="text-[#087684]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600">Temporarily disable system access</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSystemSetting('maintenanceMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.maintenanceMode ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                        <Database size={20} className="text-[#087684]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Auto Backup</h3>
                        <p className="text-sm text-gray-600">Automatically backup system data</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSystemSetting('autoBackup')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.autoBackup ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                        <Mail size={20} className="text-[#087684]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Send system notifications via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSystemSetting('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.emailNotifications ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                        <Activity size={20} className="text-[#087684]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Audit Logging</h3>
                        <p className="text-sm text-gray-600">Track all system activities</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSystemSetting('auditLogging')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.auditLogging ? 'bg-[#087684]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.auditLogging ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users size={24} className="text-[#087684]" />
                <h2 className="text-2xl font-bold text-gray-900">User Management Settings</h2>
              </div>

              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#F0F9FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-[#087684]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">User Management</h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  Advanced user management settings will be available in this section. Configure user roles, permissions, and access controls.
                </p>
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
                <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
              </div>

              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#F0F9FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-[#087684]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">System Notifications</h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  Configure system-wide notification preferences, email templates, and alert thresholds.
                </p>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200 mt-8">
            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full bg-[#087684] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#066466] disabled:bg-gray-400 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving Settings...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Save All Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;