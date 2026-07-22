'use client';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Building, Users, Settings, X, Mail, Calendar, Phone } from 'lucide-react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

const SpotlightCard = ({ children, className }: SpotlightCardProps) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  startDate: string;
}

interface IdConfig {
  role: string;
  prefix: string;
  nextNumber: number;
}

export default function UserCreationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showIdSetup, setShowIdSetup] = useState(false);
  const [idConfigs, setIdConfigs] = useState<IdConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<IdConfig>({
    role: '',
    prefix: '',
    nextNumber: 1
  });

  // Fetch ID configurations on component mount
  useEffect(() => {
    const fetchIdConfigs = async () => {
      try {
        const response = await fetch('/api/id-config');
        if (!response.ok) throw new Error('Failed to fetch ID configurations');
        const data = await response.json();
        setIdConfigs(data);
      } catch (err) {
        console.error('Error fetching ID configurations:', err);
      }
    };
    fetchIdConfigs();
  }, []);

  // Update current config when role changes
  useEffect(() => {
    if (formData.role) {
      const config = idConfigs.find(c => c.role === formData.role);
      if (config) {
        setCurrentConfig(config);
      } else {
        // Default config if none exists for this role
        setCurrentConfig({
          role: formData.role,
          prefix: formData.role.toUpperCase().substring(0, 3) + '-',
          nextNumber: 1
        });
      }
    }
  }, [formData.role, idConfigs]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIdConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentConfig(prev => ({
      ...prev,
      [name]: name === 'nextNumber' ? parseInt(value) || 0 : value
    }));
  };

  const saveIdConfig = async () => {
    try {
      const response = await fetch('/api/id-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save ID configuration');
      }

      // Refresh the configurations
      const configsResponse = await fetch('/api/id-config');
      const configs = await configsResponse.json();
      setIdConfigs(configs);

      setShowIdSetup(false);
    } catch (err) {
      console.error('Error saving ID configuration:', err);
      setError('Failed to save ID configuration');
    }
  };

  const validateForm = () => {
    const { fullName, email, phoneNumber, role, department, startDate } = formData;

    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    if (!phoneNumber.trim()) return "Phone number is required";
    if (!/^\+?[\d\s\-]+$/.test(phoneNumber)) return "Please enter a valid phone number";
    if (!role) return "Role is required";
    if (!department) return "Department is required";
    if (!startDate) return "Start date is required";

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setMessageType('');

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      if (!formData.role) {
        throw new Error('Please select a role');
      }

      const employeeId = `${currentConfig.prefix}${currentConfig.nextNumber}`;
      
      const userWithId = {
        ...formData,
        employeeId
      };

      // Create user with email notification
      const userResponse = await fetch('/api/add-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userWithId),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      // Increment the ID number for next user
      await fetch('/api/id-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentConfig,
          nextNumber: currentConfig.nextNumber + 1
        }),
      });

      setMessage(`Employee registered successfully! Password has been sent to ${formData.email}`);
      setMessageType('success');
      
      // Reset form on successful submission
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: '',
        department: '',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
        setMessageType('error');
      } else {
        setMessage('An unknown error occurred');
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      formData,
      idConfig: currentConfig,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('userDraft', JSON.stringify(draftData));
    setMessage('Draft saved successfully');
    setMessageType('success');
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Create New User & Assign Roles</h2>
        <p className="text-[#6B7280]">Add new users to the system and assign appropriate roles and departments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Total Roles</p>
              <p className="text-2xl font-bold text-[#1C1C1E] mt-1">4</p>
            </div>
            <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
              <UserCheck size={24} className="text-[#087684]" />
            </div>
          </div>
        </SpotlightCard>
        
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Total Departments</p>
              <p className="text-2xl font-bold text-[#1C1C1E] mt-1">5</p>
            </div>
            <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
              <Building size={24} className="text-[#087684]" />
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* New User Creation Form */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-[#087684] to-[#066466]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCheck size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Add New Team Member</h3>
              <p className="text-white/80 text-sm">Create a new user account with role and department assignment</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIdSetup(!showIdSetup)}
              className="ml-auto flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <Settings size={18} />
              <span>Setup ID</span>
            </button>
          </div>
        </div>
        
        {/* ID Configuration Modal */}
        {showIdSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Configure Employee ID</h3>
                <button 
                  onClick={() => setShowIdSetup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={currentConfig.role}
                    onChange={(e) => setCurrentConfig(prev => ({
                      ...prev,
                      role: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="hr-manager">HR Manager</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Prefix</label>
                  <input
                    type="text"
                    name="prefix"
                    value={currentConfig.prefix}
                    onChange={handleIdConfigChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., EMP-"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
                  <input
                    type="number"
                    name="nextNumber"
                    value={currentConfig.nextNumber}
                    onChange={handleIdConfigChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">Next ID will be:</p>
                  <p className="font-mono font-bold text-lg">
                    {currentConfig.prefix}{currentConfig.nextNumber}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIdSetup(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveIdConfig}
                  className="px-4 py-2 text-white bg-[#087684] hover:bg-[#066466] rounded-md"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8">
          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role & Department Assignment */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-[#1C1C1E] mb-6">Role & Department</h4>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-[#374151] mb-2">Role *</label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl text-[#1C1C1E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Select a role</option>
                      <option value="admin">Admin</option>
                      <option value="hr-manager">HR Manager</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-[#374151] mb-2">Department *</label>
                    <select
                      id="department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl text-[#1C1C1E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Select a department</option>
                      <option value="hr">Human Resources</option>
                      <option value="finance">Finance</option>
                      <option value="engineering">Engineering</option>
                      <option value="marketing">Marketing</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>
                  
                  <div className="bg-[#F0F9FF] p-4 rounded-xl">
                    <p className="text-sm font-medium text-[#087684] mb-1">Employee ID</p>
                    <p className="text-xl font-mono font-bold">
                      {formData.role && currentConfig.prefix 
                        ? `${currentConfig.prefix}${currentConfig.nextNumber}`
                        : 'Select a role to generate ID'}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {formData.role 
                        ? `ID format for ${formData.role} role`
                        : 'This will be assigned automatically based on role'}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-[#374151] mb-2">Start Date *</label>
                    <div className="relative">
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200 pl-12"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-[#1C1C1E] mb-6">Personal Information</h4>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-[#374151] mb-2">Full Name *</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter full name"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200 pl-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#374151] mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="+251 911 123456"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200 pl-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-[#6B7280] bg-[#F8F9FA] hover:bg-[#E9ECEF] rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-3 text-[#087684] bg-[#F0F9FF] hover:bg-[#E0F2FE] rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Save as Draft
              </button>
              <button 
                type="submit"
                disabled={loading || !formData.role}
                className="px-8 py-3 bg-gradient-to-r from-[#087684] to-[#066466] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : 'Create User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}