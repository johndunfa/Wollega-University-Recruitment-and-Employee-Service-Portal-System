'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Briefcase,
  Target
} from 'lucide-react';

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

interface User {
  employeeId: string;
  name: string;
  department: string;
}

interface CalendarEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  type: 'Meeting' | 'Task' | 'Notice' | 'Deadline' | 'Training';
  description?: string;
  priority: 'low' | 'medium' | 'high';
  attendees?: string[];
  createdBy: string;
  department: string;
}

export default function CalendarSchedule() {
  const [user, setUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Meeting' as CalendarEvent['type'],
    description: '',
    priority: 'medium' as CalendarEvent['priority'],
    attendees: [] as string[]
  });

  // Fetch user and events on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem('user');
        if (!stored) throw new Error('No user in localStorage');
        const parsed = JSON.parse(stored);

        // Fetch user info
        const userRes = await fetch('/api/get-user-by-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: parsed.employeeId }),
        });
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData: User = await userRes.json();
        setUser(userData);

        // Fetch events for user's department
        const eventsRes = await fetch(`/api/calendar/events?department=${userData.department}`);
        if (!eventsRes.ok) throw new Error('Failed to fetch events');
        const eventsData: CalendarEvent[] = await eventsRes.json();
        setEvents(eventsData);
      } catch (err: any) {
        console.error(err);
        setMessage(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Filter events based on selected date
  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateStr);
      setFilteredEvents(dayEvents);
    } else {
      setFilteredEvents(events);
    }
  }, [events, selectedDate]);

  // Handle form submission
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('User not loaded');
      return;
    }

    const newEvent: CalendarEvent = {
      _id: Date.now().toString(),
      title: eventForm.title,
      date: eventForm.date,
      time: eventForm.time,
      type: eventForm.type,
      description: eventForm.description,
      priority: eventForm.priority,
      attendees: eventForm.attendees,
      createdBy: user.name,
      department: user.department,
    };

    try {
      const res = await fetch('/api/calendar/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error('Failed to save event to server');

      // Add event to local state
      setEvents(prev => [...prev, newEvent]);
      setMessage('Event created successfully!');

      // Reset form
      setEventForm({
        title: '',
        date: '',
        time: '',
        type: 'Meeting',
        description: '',
        priority: 'medium',
        attendees: []
      });
      setShowEventForm(false);
    } catch (err: any) {
      console.error(err);
      // Fallback: still add locally if backend fails
      setEvents(prev => [...prev, newEvent]);
      setMessage('Event saved locally (sync failed)');
      setShowEventForm(false);
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      // In a real app, you'd call DELETE /api/calendar/events/:id
      // For now, we remove from UI and assume file-based backend handles it
      setEvents(prev => prev.filter(event => event._id !== eventId));
      setMessage('Event deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage('Failed to delete event');
    }
  };

  // Get icon based on event type
  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'Meeting': return <Users size={16} className="text-blue-600" />;
      case 'Task': return <Target size={16} className="text-green-600" />;
      case 'Notice': return <Bell size={16} className="text-yellow-600" />;
      case 'Deadline': return <AlertTriangle size={16} className="text-red-600" />;
      case 'Training': return <Briefcase size={16} className="text-purple-600" />;
      default: return <Calendar size={16} className="text-gray-600" />;
    }
  };

  // Get badge color class for event type
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Task': return 'bg-green-100 text-green-800 border-green-200';
      case 'Notice': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'Training': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority dot color
  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      direction === 'prev'
        ? newDate.setMonth(prev.getMonth() - 1)
        : newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#087684] to-[#066466] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Team Calendar & Schedule 📅
            </h1>
            <p className="text-[#B8E6EE] text-lg">
              Manage meetings, tasks, notices, and deadlines for your team
            </p>
            <div className="flex items-center gap-6 mt-4 text-[#B8E6EE]">
              <div className="flex items-center gap-2">
                <CalendarDays size={20} />
                <span>{events.length} Total Events</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>This Month</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Calendar size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={message.includes('Error') || message.includes('Failed') ? 'text-red-800' : 'text-green-800'}>
            {message}
          </p>
        </div>
      )}

      {/* Calendar & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Grid */}
        <div className="flex-1">
          <SpotlightCard className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-xl font-semibold text-[#1C1C1E]">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-[#6B7280]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => {
                  if (!date) return <div key={index} className="h-24 p-1"></div>;

                  const dayEvents = getEventsForDate(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`h-24 p-1 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#087684] bg-[#F0F9FF]'
                          : isToday
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`text-sm font-medium ${
                          isSelected
                            ? 'text-[#087684]'
                            : isToday
                              ? 'text-blue-600'
                              : 'text-[#1C1C1E]'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event._id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-[#6B7280]">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 space-y-6">
          {/* Events List */}
          <SpotlightCard className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFB]">
              <h3 className="text-lg font-semibold text-[#1C1C1E]">
                {selectedDate
                  ? `Events for ${selectedDate.toLocaleDateString()}`
                  : 'Upcoming Events'}
              </h3>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                  <p className="text-[#6B7280]">No events scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map(event => (
                    <div key={event._id} className="p-4 bg-[#FAFBFC] rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-[#1C1C1E]">{event.title}</h4>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`}></div>
                            </div>
                            <div className="text-sm text-[#6B7280] space-y-1">
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{event.time}</span>
                              </div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                                {event.type}
                              </div>
                              {event.description && (
                                <p className="text-xs mt-2">{event.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-[#6B7280] hover:text-[#087684] transition-colors">
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteEvent(event._id)}
                            className="p-1 text-[#6B7280] hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <TiltedCard className="p-4 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl" intensity={6}>
              <div className="text-center">
                <div className="w-8 h-8 bg-[#DBEAFE] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users size={16} className="text-[#2563EB]" />
                </div>
                <div className="text-2xl font-bold text-[#1C1C1E]">
                  {events.filter(e => e.type === 'Meeting').length}
                </div>
                <div className="text-sm text-[#6B7280]">Meetings</div>
              </div>
            </TiltedCard>
            <TiltedCard className="p-4 bg-white rounded-xl shadow-lg border border-[#E5E7EB] hover:shadow-xl" intensity={6}>
              <div className="text-center">
                <div className="w-8 h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle size={16} className="text-[#DC2626]" />
                </div>
                <div className="text-2xl font-bold text-[#1C1C1E]">
                  {events.filter(e => e.type === 'Deadline').length}
                </div>
                <div className="text-sm text-[#6B7280]">Deadlines</div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-semibold text-[#1C1C1E]">Create New Event</h3>
            </div>
            <form onSubmit={handleEventSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as CalendarEvent['type'] })}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Task">Task</option>
                    <option value="Notice">Notice</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Training">Training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Priority</label>
                  <select
                    value={eventForm.priority}
                    onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value as CalendarEvent['priority'] })}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  placeholder="Enter event description"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 text-[#6B7280] bg-[#F8F9FA] hover:bg-[#E9ECEF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}