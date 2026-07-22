'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileUp,
  UserCheck,
  Calendar,

  Settings as SettingsIcon,
  User,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Bell,
  Plus,
  Building2,
  Badge,
  Activity,
  Target,
  Award,
  Briefcase,
  MessageSquare,
  Search,
  Filter,
  Edit,
  Eye,
  MoreHorizontal,
  LogOut,
  X,
  CalendarDays,
  UserCheck as UserCheckIcon,
  FileText,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportUpload from './ReportUpload';
import Settings from './Settings';
import Profile from './Profile';
import LeaveSection from './LeaveSection';
import CalendarSchedule from './CalendarSchedule';
import ManagerReports from './ManagerReports';


type Tab = 'dashboard' | 'report' | 'profile' | 'settings' | 'leave' | 'CalendarSchedule';

// Notification types
interface Notification {
  id: string;
  type: 'schedule' | 'meeting' | 'leave' | 'report' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

// Tilted Card Component
const TiltedCard = ({ children, className = "", intensity = 10 }: { children: React.ReactNode, className?: string, intensity?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * -intensity;
      const rotateY = (x - centerX) / centerX * intensity;
      
      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      }}
    >
      {children}
    </div>
  );
};

// Spotlight Card Component (keeping for backward compatibility)
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(8, 118, 132, 0.2)" }: { children: React.ReactNode, className?: string, spotlightColor?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      divRef.current.style.setProperty("--mouse-x", `${x}px`);
      divRef.current.style.setProperty("--mouse-y", `${y}px`);
      divRef.current.style.setProperty("--spotlight-color", spotlightColor);
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        '--spotlight-color': spotlightColor
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

interface Staff {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  email?: string;
  role?: string;
  status?: string;
}

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [managerName, setManagerName] = useState('');
  const [managerDepartment, setManagerDepartment] = useState('');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [teamPerformance, setTeamPerformance] = useState(95);
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview and quick actions' },
    { id: 'report', label: 'Reports', icon: FileUp, description: 'Upload and manage reports' },
    { id: 'leave', label: 'Leave Management', icon: UserCheck, description: 'Manage team leave requests' },
    { id: 'CalendarSchedule', label: 'Calendar', icon: Calendar, description: 'Schedule and events' },
    
    { id: 'profile', label: 'Profile', icon: User, description: 'Your profile settings' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, description: 'Dashboard preferences' }
  ];

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'leave',
      title: 'Leave Request Pending',
      message: 'John Doe has submitted a leave request for next week',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      priority: 'high',
      actionUrl: '/dashboard/manager?tab=leave'
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Team Meeting Reminder',
      message: 'Weekly team meeting starts in 30 minutes',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: false,
      priority: 'medium',
      actionUrl: '/dashboard/manager?tab=CalendarSchedule'
    },
    {
      id: '3',
      type: 'schedule',
      title: 'Upcoming Event',
      message: 'Department review meeting scheduled for tomorrow at 10 AM',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/dashboard/manager?tab=CalendarSchedule'
    },
    {
      id: '4',
      type: 'report',
      title: 'Monthly Report Due',
      message: 'Monthly department report is due by end of week',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: true,
      priority: 'low',
      actionUrl: '/dashboard/manager?tab=report'
    },
    {
      id: '5',
      type: 'general',
      title: 'System Update',
      message: 'New features have been added to the dashboard',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: true,
      priority: 'low'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    const fetchManagerAndStaff = async () => {
      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) return;

      try {
        // 1. Get manager's data
        const res = await fetch('/api/get-user-by-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: employeeId }),
        });

        const { user } = await res.json();
        if (user) {
          setManagerName(user.name);
          setManagerDepartment(user.department);

          // 2. Fetch staff in same department
          const staffRes = await fetch('/api/get-staff-by-department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ department: user.department }),
          });

          const staffData = await staffRes.json();
          setStaffList(staffData.employees || []);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerAndStaff();
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('employeeId');
    window.location.href = '/login';
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate to relevant tab if actionUrl is provided
    if (notification.actionUrl) {
      const urlParams = new URLSearchParams(notification.actionUrl.split('?')[1]);
      const tab = urlParams.get('tab');
      if (tab && ['dashboard', 'report', 'leave', 'CalendarSchedule', 'profile', 'settings'].includes(tab)) {
        setActiveTab(tab as Tab);
      }
    }

    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'leave':
        return <UserCheckIcon size={16} className="text-orange-500" />;
      case 'meeting':
        return <CalendarDays size={16} className="text-blue-500" />;
      case 'schedule':
        return <Calendar size={16} className="text-green-500" />;
      case 'report':
        return <FileText size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => 
    notificationFilter === 'all' || !notification.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#087684] to-[#066466] rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {managerName}! 👋
                  </h1>
                  <p className="text-[#B8E6EE] text-lg mb-4">
                    Here's your team overview for the {managerDepartment} Department
                  </p>
                  <div className="flex items-center gap-6 text-[#B8E6EE]">
                    <div className="flex items-center gap-2">
                      <Building2 size={20} />
                      <span>{managerDepartment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      <span>{staffList.length} Team Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge size={20} />
                      <span>Manager</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                    <Users size={40} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl" intensity={8}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">Team Members</p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">{staffList.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
                    <Users size={24} className="text-[#087684]" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl" intensity={8}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">Pending Leaves</p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">{pendingLeaves}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-[#D97706]" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl" intensity={8}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">Upcoming Events</p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">{upcomingEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-[#2563EB]" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl" intensity={8}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">Team Performance</p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">{teamPerformance}%</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-[#059669]" />
                  </div>
                </div>
              </TiltedCard>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-semibold text-[#1C1C1E] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('leave')}
                  className="flex items-center space-x-3 p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                    <UserCheck size={20} className="text-[#D97706]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#1C1C1E]">Review Leave Requests</div>
                    <div className="text-sm text-[#6B7280]">Approve or reject pending requests</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('CalendarSchedule')}
                  className="flex items-center space-x-3 p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-[#2563EB]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#1C1C1E]">Schedule Meeting</div>
                    <div className="text-sm text-[#6B7280]">Add events to team calendar</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('report')}
                  className="flex items-center space-x-3 p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                    <FileUp size={20} className="text-[#087684]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#1C1C1E]">Upload Report</div>
                    <div className="text-sm text-[#6B7280]">Submit department reports</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Team Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1C1C1E]">Team Members</h3>
                    <p className="text-sm text-[#6B7280]">{managerDepartment} Department Staff</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">
                      <Filter size={14} className="inline mr-1" />
                      Filter
                    </button>
                    <button className="px-3 py-1 text-sm bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors">
                      <Plus size={14} className="inline mr-1" />
                      Add Member
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
            {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#087684]"></div>
                  </div>
            ) : staffList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                    <h4 className="text-lg font-medium text-[#1C1C1E] mb-2">No Team Members Found</h4>
                    <p className="text-[#6B7280]">No staff members found in the {managerDepartment} department.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map((staff) => (
                      <SpotlightCard key={staff._id} className="p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                              <User size={20} className="text-[#087684]" />
                            </div>
                            <div>
                              <div className="font-medium text-[#1C1C1E]">{staff.name}</div>
                              <div className="text-sm text-[#6B7280]">{staff.role || 'Employee'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-[#6B7280] hover:text-[#087684] transition-colors">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-[#6B7280] hover:text-[#087684] transition-colors">
                              <MessageSquare size={16} />
                            </button>
                            <button className="p-1 text-[#6B7280] hover:text-[#087684] transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                          <div className="flex items-center justify-between text-sm text-[#6B7280]">
                            <span>ID: {staff.employeeId}</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                )}
              </div>
            </div>


          </div>
        );

      case 'report':
        return <ManagerReports />;
      case 'profile':
        return <Profile />;
      case 'CalendarSchedule':
        return <CalendarSchedule />;

      case 'settings':
        return <Settings />;
      case 'leave':
        return <LeaveSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFB]">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 bg-white shadow-lg border-r border-[#E5E7EB] flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#087684] to-[#066466] rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1C1C1E]">Manager Portal</h2>
              <p className="text-sm text-[#6B7280]">Team Management Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#087684] to-[#066466] text-white shadow-lg' 
                    : 'text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F3F4F6]'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#087684]'} transition-colors`}
                />
                <div className="flex-1">
                  <div className={`font-medium ${isActive ? 'text-white' : 'text-[#1C1C1E]'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-white/70' : 'text-[#6B7280]'}`}>
                    {item.description}
                  </div>
                </div>
            </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center space-x-3 p-3 bg-[#F8FAFB] rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-[#087684] to-[#066466] rounded-lg flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#1C1C1E]">{managerName}</div>
              <div className="text-sm text-[#6B7280]">{managerDepartment} Manager</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-[#1C1C1E]">
              {activeTab === 'dashboard' ? 'Manager Portal' : sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              <span>•</span>
              <span>{sidebarItems.find(item => item.id === activeTab)?.description}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-50"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-[#E5E7EB]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#1C1C1E]">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-[#087684] hover:text-[#066466] transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F3F4F6] rounded transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex space-x-1 mt-3">
                        <button
                          onClick={() => setNotificationFilter('all')}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            notificationFilter === 'all'
                              ? 'bg-[#087684] text-white'
                              : 'text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F3F4F6]'
                          }`}
                        >
                          All ({notifications.length})
                        </button>
                        <button
                          onClick={() => setNotificationFilter('unread')}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            notificationFilter === 'unread'
                              ? 'bg-[#087684] text-white'
                              : 'text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F3F4F6]'
                          }`}
                        >
                          Unread ({unreadCount})
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell size={32} className="mx-auto text-[#9CA3AF] mb-2" />
                          <p className="text-[#6B7280]">No notifications</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          {filteredNotifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                                getPriorityColor(notification.priority)
                              } ${
                                notification.isRead
                                  ? 'bg-[#FAFBFC] hover:bg-[#F3F4F6]'
                                  : 'bg-blue-50 hover:bg-blue-100'
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      notification.isRead ? 'text-[#1C1C1E]' : 'text-[#1C1C1E]'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#6B7280] mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-[#9CA3AF] mt-2">
                                    {formatTimeAgo(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
