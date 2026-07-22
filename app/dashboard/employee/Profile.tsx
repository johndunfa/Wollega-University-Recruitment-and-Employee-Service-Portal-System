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
  Shield
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
    alert('Request sent to HR for profile update.');
    setProfileUpdate({ address: '', contactNumber: '', otherChanges: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-red-600" />
          </div>
          <p className="text-xl text-red-600">Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#087684] to-[#066466] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} className="text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-[#B8E6EE] text-lg mb-4">{user.position}</p>
            <div className="flex items-center gap-4 text-[#B8E6EE]">
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>{user.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge size={16} />
                <span>{user.employeeId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'requests', label: 'Update Requests', icon: Edit }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeSection === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', value: user.name, icon: User, color: 'text-blue-600' },
                  { label: 'Email Address', value: user.email, icon: Mail, color: 'text-green-600' },
                  { label: 'Employee ID', value: user.employeeId, icon: Badge, color: 'text-purple-600' },
                  { label: 'Department', value: user.department, icon: Building2, color: 'text-orange-600' },
                  { label: 'Role', value: user.role, icon: Shield, color: 'text-red-600' },
                  { label: 'Position', value: user.position, icon: User, color: 'text-indigo-600' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <item.icon size={20} className={item.color} />
                      <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    </div>
                    <p className="text-gray-700 text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lock size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={20} className="text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Change Password</h3>
                </div>
                <p className="text-yellow-700 mb-4">
                  Enter your current and new password below. Changes will be applied directly to your account.
                </p>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const currentPassword = (form.elements[0] as HTMLInputElement).value;
                    const newPassword = (form.elements[1] as HTMLInputElement).value;

                    try {
                      const res = await fetch('/api/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          employeeId: user?.employeeId, 
                          currentPassword, 
                          newPassword 
                        }),
                      });

                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message);

                      alert('Password updated successfully!');
                      form.reset();
                    } catch (error: any) {
                      alert(error.message || 'Failed to change password');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter current password" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Lock size={20} />
                    Change Password
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Profile Update Requests Section */}
          {activeSection === 'requests' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Edit size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Profile Update Requests</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Edit size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Request Profile Changes</h3>
                </div>
                <p className="text-blue-700 mb-6">
                  Submit requests for profile updates such as address, contact information, or emergency contacts. These changes will be reviewed by HR.
                </p>
                
                <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      New Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your new address"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={profileUpdate.address}
                      onChange={(e) => setProfileUpdate((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      New Contact Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your new contact number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={profileUpdate.contactNumber}
                      onChange={(e) => setProfileUpdate((prev) => ({ ...prev, contactNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Changes
                    </label>
                    <textarea
                      placeholder="Describe other changes you'd like to make (e.g., emergency contact, marital status, etc.)"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                      value={profileUpdate.otherChanges}
                      onChange={(e) => setProfileUpdate((prev) => ({ ...prev, otherChanges: e.target.value }))}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Save size={20} />
                    Submit Request to HR
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
