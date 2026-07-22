'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  Users,
  Settings,
  FilePlus,
  Mail,
  Upload,
  ShieldCheck,
  Activity,
  Bell,
  User,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react'
import UserCreationForm from './UserCreationForm'
import UserManagement from './UserManagement'
import EmailCredentials from './EmailCredentials'
import AdminSettings from './AdminSettings'
import NotificationDropdown from '@/components/NotificationDropdown'
import { useRouter } from 'next/navigation';
import GenerateCredentials from './GenerateCredentials'

// ---------------- Types ----------------
interface Notification {
    actionUrl: any;
  _id: string
  title: string
  message: string
  type: string
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: Date
}

// ---------------- Menu Items ----------------
const menuItems = [
  { title: 'User Management', icon: <Users size={20} />, content: 'Create and manage user accounts (HR, managers, employees).' },
  { title: 'Assign Roles & Departments', icon: <Settings size={20} />, content: 'Set roles and assign departments.' },
  { title: 'Generate Login Credentials', icon: <FilePlus size={20} />, content: 'Generate login credentials for employees.' },
  { title: 'Send Credentials via Email', icon: <Mail size={20} />, content: 'Send login credentials to employees via email.' },
  { title: 'Bulk Upload Employees (CSV)', icon: <Upload size={20} />, content: 'Bulk upload employee data using a CSV file.' },
  { title: 'View System Logs', icon: <Activity size={20} />, content: 'View system usage logs and audit trails.' },
  { title: 'Settings', icon: <ShieldCheck size={20} />, content: 'Configure system settings, security policies, and administrative preferences.' },
]

// ---------------- Component ----------------
export default function AdminDashboard() {
  const [selected, setSelected] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all')
  const notificationRef = useRef<HTMLDivElement>(null)

const [user, setUser] = useState<{
    name: string;
    employeeId: string;
    email: string;
    role: string;
    department: string;
  } | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(storedUser);
      const userRes = await fetch("/api/get-user-by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: parsed.employeeId }),
      });

      if (!userRes.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await userRes.json();
      setUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        employeeId: userData.employeeId,
        department: userData.department,
      });

      // Fetch notifications
      const notifRes = await fetch("/api/notifications");
      if (notifRes.ok) {
        setNotifications(await notifRes.json());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [router]);


  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) throw new Error('Failed to fetch notifications')
        const data = await res.json()
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/update', { method: 'PUT' })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  // Mark single notification as read
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification._id}/read`, { method: 'PUT' })
        setNotifications(notifications.map(n =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ))
      } catch (err) {
        console.error('Error marking notification as read:', err)
      }
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST' }) // adjust to your backend
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="flex h-screen bg-[#F5F7F8] font-['Inter']">
      {/* Sidebar */}
      <aside className="w-[250px] bg-[#0A1D1A] text-white flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-[#1A2F2A]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#087684] rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
              <p className="text-xs text-[#9CA3AF]">System Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                selected === index
                  ? 'bg-[#087684] text-white shadow-md'
                  : 'text-[#D1D5DB] hover:bg-[#1A2F2A] hover:text-white'
              }`}
              onClick={() => setSelected(index)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="font-medium text-sm">{item.title}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#1A2F2A]">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#1A2F2A]">
            <div className="w-8 h-8 bg-[#087684] rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
              {user?.name || user?.employeeId || 'Guest'}
            </p>
            <p className="text-xs text-[#9CA3AF] truncate">
              {user?.role || 'No email'}
            </p>

            </div>
            <button
              onClick={handleLogout}
              className="text-[#9CA3AF] hover:text-white transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-[#1C1C1E]">
              {menuItems[selected].title}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              <span>•</span>
              <span>{menuItems[selected].content}</span>
            </div>
          </div>

          {/* Notification Bell */}
          <div className="relative">
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

            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              notificationFilter={notificationFilter}
              setNotificationFilter={setNotificationFilter}
              markAllAsRead={markAllAsRead}
              handleNotificationClick={handleNotificationClick}
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {selected === 0 && <UserManagement />}
          {selected === 1 && <UserCreationForm />}
          {selected === 2 && <GenerateCredentials />}
          {selected === 3 && <EmailCredentials />}
          {selected === 6 && <AdminSettings />}
        </div>
      </main>
    </div>
  )
}
