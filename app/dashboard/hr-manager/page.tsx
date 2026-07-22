'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  FileText,
  UserCheck,
  ListOrdered,
  Users,
  LayoutDashboard,
  ClipboardList,
  Building,
  LogOut,
  User,
  Bell,
  X,
  Plus,
  Filter,
  Eye,
  MessageSquare,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Target,
  Award,
  Activity,
  Search,
  Edit,
  ChevronDown,
  ChartBar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CreateJobForm from '@/components/CreateJobForm';
import ManageJobs from '@/components/manageJobs';
import DefineQualification from '@/components/DefineQualification';
import ViewApplicants from '@/components/ViewApplicants';
import ResumeScorer from '@/app/score-resume/page';
import RankedApplicants from './RankedApplicants';
import HireCandidates from './HireCandidates';
import CandidateStatus from './CandidateStatus';
import HireCandidateForm from './HiredCandidateForm';
import LeaveSection from '../hr-manager/LeaveSection';

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

// Spotlight Card Component
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(8, 118, 132, 0.2)", onClick }: { children: React.ReactNode, className?: string, spotlightColor?: string, onClick?: () => void }) => {
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
      onClick={onClick}
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

// Notification types
interface Notification {
  id: string;
  type: 'job' | 'applicant' | 'leave' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

const menuItems = [
  {
    label: "Dashboard Home",
    icon: LayoutDashboard,
    action: "home",
    description: "Overview and quick actions",
  },
  {
    label: "Create Job Post",
    icon: Briefcase,
    action: "createJob",
    description: "Create new job listings",
  },
  {
    label: "Edit/Delete Job Post",
    icon: FileText,
    action: "manageJobs",
    description: "Manage existing jobs",
  },
  {
    label: "Define Qualifications",
    icon: ClipboardList,
    action: "qualifications",
    description: "Set job requirements",
  },
  {
    label: "Rank Applicants",
    icon: ListOrdered,
    action: "viewApplicants",
    description: "Screened candidates",
  },
  {
    label: "Exam Candidates",
    icon: FileText,
    action: "candidates",
    description: "Enter candidates Exam Results",
  },
  {
    label: "View Applicants",
    icon: UserCheck,
    action: "rankedApplicants",
    description: "Review applications",
  },
  {
    label: "Candidate Status Tracking",
    icon: FileText,
    action: "candidateStatus",
    description: "Check candidate status and Hire",
  },
  {
    label: "Employee Data",
    icon: Users,
    action: "employeeData",
    description: "View employee information",
  },
  {
    label: "Hired Candidate Form",
    icon: Briefcase,
    action: "hiredCandidate",
    description: "Hired Candidate Form",
  },
  {
    label: "Manage Leave Requests",
    icon: ClipboardList,
    action: "leaveRequests",
    description: "Handle leave requests",
  },
  {
    label: "Profile",
    icon: User,
    action: "profile",
    description: "Your profile settings",
  },
];

const HRDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{
    name: string;
    employeeId: string;
    email: string;
    role: string;
    department: string;
  } | null>(null);

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'applicant',
      title: 'New Application Received',
      message: 'John Doe has applied for the Software Engineer position',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      priority: 'high',
      actionUrl: '/dashboard/hr-manager?section=viewApplicants'
    },
    {
      id: '2',
      type: 'job',
      title: 'Job Post Expiring Soon',
      message: 'Marketing Manager position expires in 3 days',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium',
      actionUrl: '/dashboard/hr-manager?section=manageJobs'
    },
    {
      id: '3',
      type: 'leave',
      title: 'Leave Request Pending',
      message: 'Sarah Johnson has submitted a leave request',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      priority: 'medium',
      actionUrl: '/dashboard/hr-manager?section=leaveRequests'
    },
    {
      id: '4',
      type: 'general',
      title: 'System Update',
      message: 'New HR dashboard features have been added',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low'
    }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      const employeeId = parsed.employeeId;

      const fetchUser = async () => {
        const res = await fetch('/api/get-user-by-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: employeeId }),
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name,
            email: data.email,
            role: data.role,
            employeeId: data.employeeId,
            department: data.department,
          });
        } else {
          console.error('Failed to fetch user info');
          router.push('/login');
        }
      };

      fetchUser();
    } catch (err) {
      console.error('Invalid user in localStorage:', err);
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

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
    router.push('/login');
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    if (notification.actionUrl) {
      const urlParams = new URLSearchParams(notification.actionUrl.split('?')[1]);
      const section = urlParams.get('section');
      if (section && menuItems.find(item => item.action === section)) {
        setActiveSection(section);
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
      case 'applicant':
        return <UserCheck size={16} className="text-green-500" />;
      case 'job':
        return <Briefcase size={16} className="text-blue-500" />;
      case 'leave':
        return <Clock size={16} className="text-orange-500" />;
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
    switch (activeSection) {
      case "createJob":
        return <CreateJobForm />;
      case "manageJobs":
        return <ManageJobs />;
      case "qualifications":
        return <DefineQualification />;
      case "viewApplicants":
        return <ViewApplicants />;
      case "candidates":
        return <HireCandidates />;
      case "rankedApplicants":
        return <RankedApplicants />;
      case "candidateStatus":
        return <CandidateStatus />;
      case "hiredCandidate":
        return <HireCandidateForm />;
      case "employeeData":
        return <p>View employee details across all departments.</p>;
      case "leaveRequests":
        return <LeaveSection />;
      case "profile":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              User Profile
            </h2>
            <div className="text-gray-700">
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Employee ID:</strong> {user?.employeeId}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> {user?.role}
              </p>
              <p>
                <strong>Department:</strong> {user?.department}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#087684] to-[#066466] rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name}! 👋
                  </h1>
                  <p className="text-[#B8E6EE] text-lg mb-4">
                    Here's your HR overview for managing recruitment and
                    employee data
                  </p>
                  <div className="flex items-center gap-6 text-[#B8E6EE]">
                    <div className="flex items-center gap-2">
                      <Building size={20} />
                      <span>Human Resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      <span>HR Manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={20} />
                      <span>Recruitment Hub</span>
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
              <TiltedCard
                className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl"
                intensity={8}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">
                      Active Jobs
                    </p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
                    <Briefcase size={24} className="text-[#087684]" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard
                className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl"
                intensity={8}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">
                      New Applications
                    </p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">8</p>
                  </div>
                  <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                    <UserCheck size={24} className="text-[#D97706]" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard
                className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl"
                intensity={8}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">
                      Pending Reviews
                    </p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">15</p>
                  </div>
                  <div className="w-12 h-12 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-[#2563EB]" />
                  </div>
                </div>
              </TiltedCard>

              <TiltedCard
                className="p-6 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl"
                intensity={8}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-[#1C1C1E] mt-1">
                      85%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-[#059669]" />
                  </div>
                </div>
              </TiltedCard>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-semibold text-[#1C1C1E] mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection("createJob")}
                  className="flex items-center space-x-3 p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                    <Plus size={20} className="text-[#087684]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#1C1C1E]">
                      Create Job Post
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      Add new job listings
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection("viewApplicants")}
                  className="flex items-center space-x-3 p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                    <UserCheck size={20} className="text-[#D97706]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#1C1C1E]">
                      Review Applications
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      View candidate submissions
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection("manageJobs")}
                  className="flex items-center space-x-3 p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-[#2563EB]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#1C1C1E]">
                      Manage Jobs
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      Edit existing job posts
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* HR Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1C1C1E]">
                      HR Management
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      Recruitment and employee management tools
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">
                      <Filter size={14} className="inline mr-1" />
                      Filter
                    </button>
                    <button className="px-3 py-1 text-sm bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors">
                      <Plus size={14} className="inline mr-1" />
                      New Job
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.slice(1, 7).map((item) => (
                    <SpotlightCard
                      key={item.action}
                      className="p-4 bg-[#FAFBFC] rounded-xl hover:bg-[#F5F7FA] transition-colors cursor-pointer"
                      onClick={() => setActiveSection(item.action)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                          <item.icon size={20} className="text-[#087684]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#1C1C1E]">
                            {item.label}
                          </div>
                          <div className="text-sm text-[#6B7280]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
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
              <h2 className="text-lg font-bold text-[#1C1C1E]">HR Portal</h2>
              <p className="text-sm text-[#6B7280]">Recruitment Management Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.action;
            
            return (
              <button
                key={item.action}
                onClick={() => setActiveSection(item.action)}
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
              <div className="font-medium text-[#1C1C1E]">{user?.name}</div>
              <div className="text-sm text-[#6B7280]">HR Manager</div>
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
               {activeSection === 'home' ? 'HR Dashboard' : menuItems.find(item => item.action === activeSection)?.label || 'Dashboard'}
             </h1>
             <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
               <span>•</span>
               <span>{menuItems.find(item => item.action === activeSection)?.description}</span>
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

export default HRDashboard;