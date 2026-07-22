// components/NotificationDropdown.tsx
'use client'

import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface Notification {
    actionUrl: any;
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationFilter: 'all' | 'unread';
  setNotificationFilter: (filter: 'all' | 'unread') => void;
  markAllAsRead: () => void;
  handleNotificationClick: (notification: Notification) => void;
}

const NotificationDropdown = ({
  notifications,
  unreadCount,
  showNotifications,
  setShowNotifications,
  notificationFilter,
  setNotificationFilter,
  markAllAsRead,
  handleNotificationClick
}: NotificationDropdownProps) => {
  const notificationRef = useRef<HTMLDivElement>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={18} className="text-yellow-500" />
      case 'success': return <CheckCircle size={18} className="text-green-500" />
      case 'error': return <XCircle size={18} className="text-red-500" />
      case 'info': return <Info size={18} className="text-blue-500" />
      default: return <Bell size={18} className="text-gray-500" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const filteredNotifications = notificationFilter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  return (
    <div className="relative" ref={notificationRef}>
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-[99999]"
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
                      key={notification._id}
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
                            {formatTimeAgo(notification.createdAt)}
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
  )
}

export default NotificationDropdown