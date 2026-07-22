'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Badge, 
  Building2, 
  Lock, 
  Edit, 
  Save,
  Camera,
  MapPin,
  Phone,
  Shield,
  AlertCircle,
  CheckCircle,
  Edit3
} from 'lucide-react';

interface UserType {
  name: string;
  employeeId: string;
  email: string;
  role: string;
  position: string;
  department: string;
}

interface ProfileUpdate {
  address: string;
  contactNumber: string;
  otherChanges: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [profileUpdate, setProfileUpdate] = useState<ProfileUpdate>({
    address: '',
    contactNumber: '',
    otherChanges: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
          return;
        }

        const employeeId = parsedUser?.employeeId;
        if (!employeeId) return;

        const res = await fetch('/api/get-user-by-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: employeeId }),
        });

        if (!res.ok) throw new Error(`Failed to fetch user: ${res.statusText}`);

        const data = await res.json();
        setUser({
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          employeeId: data.employeeId || 'N/A',
          role: data.role || 'Employee',
          department: data.department || 'N/A',
          position: data.position || 'N/A',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowPasswordSuccess(true);
    setTimeout(() => setShowPasswordSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#087684]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-[#1C1C1E] mb-2">Unable to load profile</h3>
          <p className="text-[#6B7280]">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#087684] to-[#066466] rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Information</h1>
            <p className="text-[#B8E6EE] text-lg">Manage your account details and preferences</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <User size={40} className="text-white/80" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6"
      >
        <h3 className="text-lg font-semibold text-[#1C1C1E] mb-6 flex items-center gap-2">
          <User size={20} className="text-[#087684]" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-lg">
              <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                <User size={20} className="text-[#087684]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Full Name</p>
                <p className="font-medium text-[#1C1C1E]">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-lg">
              <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                <Badge size={20} className="text-[#087684]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Employee ID</p>
                <p className="font-medium text-[#1C1C1E]">{user.employeeId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-lg">
              <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-[#087684]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Email Address</p>
                <p className="font-medium text-[#1C1C1E]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-lg">
              <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-[#087684]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Department</p>
                <p className="font-medium text-[#1C1C1E]">{user.department}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-lg">
              <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                <Badge size={20} className="text-[#087684]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Position</p>
                <p className="font-medium text-[#1C1C1E]">{user.position}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-lg">
              <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                <User size={20} className="text-[#087684]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Role</p>
                <p className="font-medium text-[#1C1C1E]">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Change Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6"
      >
        <h3 className="text-lg font-semibold text-[#1C1C1E] mb-6 flex items-center gap-2">
          <Lock size={20} className="text-[#087684]" />
          Change Password
        </h3>
        
        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-2">Current Password</label>
            <input 
              type="password" 
              placeholder="Enter current password" 
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-2">New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="bg-[#087684] text-white px-6 py-3 rounded-lg hover:bg-[#066466] transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Request Password Change
          </button>
        </form>

        {showPasswordSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-800">Password change request submitted successfully!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Profile Update Request Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6"
      >
        <h3 className="text-lg font-semibold text-[#1C1C1E] mb-6 flex items-center gap-2">
          <Edit3 size={20} className="text-[#087684]" />
          Request Profile Update
        </h3>
        
        <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
              <MapPin size={16} />
              New Address
            </label>
            <input
              type="text"
              placeholder="Enter your new address"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
              value={profileUpdate.address}
              onChange={(e) => setProfileUpdate((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
              <Phone size={16} />
              New Contact Number
            </label>
            <input
              type="text"
              placeholder="Enter your new contact number"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
              value={profileUpdate.contactNumber}
              onChange={(e) => setProfileUpdate((prev) => ({ ...prev, contactNumber: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-2">Other Change Requests</label>
            <textarea
              placeholder="Describe any other changes you'd like to request (e.g., emergency contact, name change, etc.)"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
              rows={4}
              value={profileUpdate.otherChanges}
              onChange={(e) => setProfileUpdate((prev) => ({ ...prev, otherChanges: e.target.value }))}
            />
          </div>
          
          <button 
            type="submit" 
            className="bg-[#F59E0B] text-white px-6 py-3 rounded-lg hover:bg-[#D97706] transition-colors flex items-center gap-2"
          >
            <Edit3 size={16} />
            Submit to HR
          </button>
        </form>

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-800">Profile update request submitted successfully!</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;