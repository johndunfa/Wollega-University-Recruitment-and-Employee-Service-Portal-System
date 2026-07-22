// app/dashboard/employee/LeaveSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  CalendarDays,
  User,
  Building2,
  FileText,
  Send,
  History,
  Search,
  FileCheck,
} from 'lucide-react';

// === Interfaces ===
interface User {
  name?: string;
  employeeId: string;
  email?: string;
  role: string;
  position?: string;
  department?: string;
}

interface LeaveRequestData {
  _id?: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  submittedDate?: string;
  approvedBy?: string;
  actualReturnDate?: string;
  report?: string;
  startWorkStatus?: 'leaved' | 'reported';
}

interface LeaveBalance {
  annual: number;
  sick: number;
  casual: number;
  emergency: number;
}

// === State Interface ===
interface State {
  user: User | null;
  activeTab: 'request' | 'balance' | 'history';
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  statusMessage: string;
  messageType: 'success' | 'error' | 'info';
  leaveRequests: LeaveRequestData[];
  loading: boolean;
  filterStatus: string;
  searchTerm: string;
  leaveBalance: LeaveBalance;
}

// === Main Class Component ===
class LeaveSection extends React.Component<{}, State> {
  private readonly GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

  constructor(props: {}) {
    super(props);
    this.state = {
      user: null,
      activeTab: 'request',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      statusMessage: '',
      messageType: 'info',
      leaveRequests: [],
      loading: false,
      filterStatus: 'all',
      searchTerm: '',
      leaveBalance: {
        annual: 15,
        sick: 10,
        casual: 8,
        emergency: 3,
      },
    };
  }

  componentDidMount() {
    this.fetchUserData();
  }

  componentDidUpdate(prevProps: {}, prevState: State) {
    if (!prevState.user && this.state.user) {
      this.fetchLeaveRequests();
      this.fetchLeaveBalance();
    }
  }

  // === Fetch User Data ===
  fetchUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        this.setState({
          statusMessage: 'You are not logged in.',
          messageType: 'error',
        });
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Invalid user data in localStorage', e);
        this.setState({
          statusMessage: 'Invalid user data.',
          messageType: 'error',
        });
        return;
      }

      const employeeId = parsedUser?.employeeId;
      const role = parsedUser?.role;

      if (!employeeId || !role) {
        this.setState({
          statusMessage: 'Missing employee ID or role.',
          messageType: 'error',
        });
        return;
      }

      const res = await fetch('/api/get-user-by-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '(failed to read response)');
        throw new Error(`Failed to fetch user: ${res.status} ${text}`);
      }

      const data = await res.json();

      this.setState({
        user: {
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          employeeId: data.employeeId || employeeId,
          role: data.role || role,
          department: data.department || 'N/A',
          position: data.position || 'N/A',
        },
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      this.setState({
        statusMessage: 'Failed to load user data.',
        messageType: 'error',
      });
    }
  };

  // === Fetch Leave Requests ===
  fetchLeaveRequests = async () => {
    const { user } = this.state;
    if (!user) return;

    this.setState({ loading: true });
    try {
      const res = await fetch('/api/leave/my-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId }),
      });

      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        const text = await res.text().catch(() => '(failed to read error)');
        console.error('Fetch requests failed:', text);
        throw new Error('Invalid response from server');
      }

      const data = await res.json();
      const leaves = Array.isArray(data.leaves) ? data.leaves : [];

      const normalizedLeaves = leaves.map((leave: any) => ({
        ...leave,
        _id: leave._id || leave.id,
      }));

      this.setState({ leaveRequests: normalizedLeaves });
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      this.setState({
        statusMessage: 'Failed to load requests.',
        messageType: 'error',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  // === Fetch Leave Balance ===
  fetchLeaveBalance = async () => {
    const { user } = this.state;
    if (!user) return;

    try {
      const res = await fetch('/api/leave/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId }),
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        this.setState({
          leaveBalance: data.balance || this.state.leaveBalance,
        });
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  // === Submit Leave Request ===
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, leaveType, startDate, endDate, reason } = this.state;

    if (!user) {
      this.setState({
        statusMessage: 'User not loaded.',
        messageType: 'error',
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      this.setState({
        statusMessage: 'End date must be after start date.',
        messageType: 'error',
      });
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await fetch('/api/leave/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      if (!res.headers.get('content-type')?.includes('application/json')) {
        const text = await res.text();
        console.error('Submit response not JSON:', text);
        throw new Error('Server returned invalid response');
      }

      const result = await res.json();

      this.setState({
        statusMessage: result.message || 'Request submitted!',
        messageType: res.ok ? 'success' : 'error',
      });

      if (res.ok && result.success) {
        this.setState(
          {
            leaveType: '',
            startDate: '',
            endDate: '',
            reason: '',
            activeTab: 'history',
          },
          () => {
            this.fetchLeaveRequests();
            this.fetchLeaveBalance();
          }
        );
      }
    } catch (err) {
      console.error('Submit error:', err);
      this.setState({
        statusMessage: 'Network error or server unreachable.',
        messageType: 'error',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  // ✅ === UPDATED: handleReportClick - Now Re-fetches from DB to Ensure Data is Stored ===
  handleReportClick = async (leaveRequestId: string) => {
    const { user, loading } = this.state;

    if (loading) return;

    if (!user) {
      this.setState({
        statusMessage: 'You are not logged in.',
        messageType: 'error',
      });
      return;
    }

    if (!leaveRequestId || typeof leaveRequestId !== 'string' || !leaveRequestId.trim()) {
      this.setState({
        statusMessage: 'Invalid request ID.',
        messageType: 'error',
      });
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await fetch('/api/leave/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          leaveRequestId: leaveRequestId.trim(),
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text().catch(() => '(unable to read error body)');
        console.error('Non-JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }

      const result = await res.json();

      if (res.ok && result.success) {
        // ✅ CRITICAL: Instead of optimistic update, REFRESH from DB
        this.setState({
          statusMessage: 'Return reported successfully.',
          messageType: 'success',
        }, () => {
          // 🔁 Force re-fetch from database to ensure persistence is reflected
          this.fetchLeaveRequests();
          this.fetchLeaveBalance();
        });
      } else {
        this.setState({
          statusMessage: result.message || 'Reporting failed. Please try again.',
          messageType: 'error',
        });
      }
    } catch (err) {
      console.error('Error in handleReportClick:', err);
      this.setState({
        statusMessage: 'Failed to report return. Please check your connection.',
        messageType: 'error',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  // === Calculate Leave Days ===
  calculateLeaveDays = () => {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // === Get Status Display ===
  getLeaveStatusDisplay = (request: LeaveRequestData) => {
    const { status, endDate, actualReturnDate, startWorkStatus } = request;

    if (actualReturnDate || startWorkStatus === 'reported') {
      return {
        label: 'Reported',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
      };
    }

    if (status !== 'approved') {
      switch (status.toLowerCase()) {
        case 'rejected':
          return {
            label: 'Rejected',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
          };
        default:
          return {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
          };
      }
    }

    const end = new Date(endDate);
    const today = new Date();
    const timeAfterEnd = today.getTime() - end.getTime();

    if (today >= new Date(request.startDate) && today <= end) {
      return {
        label: 'On Leave',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
      };
    }

    if (timeAfterEnd > 0) {
      if (timeAfterEnd <= this.GRACE_PERIOD_MS) {
        return {
          label: 'Wait for Report',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertCircle,
        };
      } else {
        return {
          label: 'Overdue',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
        };
      }
    }

    return {
      label: 'Approved',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
    };
  };

  // === Computed: Filtered Requests ===
  get filteredRequests() {
    const { leaveRequests, filterStatus, searchTerm } = this.state;
    return leaveRequests.filter((req) => {
      const matchesStatus = filterStatus === 'all' || req.status.toLowerCase() === filterStatus;
      const matchesSearch =
        req.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  // === Options ===
  readonly leaveTypeOptions = [
    { value: 'Annual', label: 'Annual Leave', color: 'bg-blue-100 text-blue-800' },
    { value: 'Sick', label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
    { value: 'Casual', label: 'Casual Leave', color: 'bg-green-100 text-green-800' },
    { value: 'Emergency', label: 'Emergency Leave', color: 'bg-orange-100 text-orange-800' },
    { value: 'Vacation', label: 'Vacation Leave', color: 'bg-purple-100 text-purple-800' },
  ];

  readonly tabs = [
    { id: 'request', label: 'New Request', icon: Plus },
    { id: 'balance', label: 'Leave Balance', icon: CalendarDays },
    { id: 'history', label: 'Request History', icon: History },
  ];

  // === Render ===
  render() {
    const {
      user,
      activeTab,
      leaveType,
      startDate,
      endDate,
      reason,
      statusMessage,
      messageType,
      loading,
      filterStatus,
      searchTerm,
      leaveBalance,
    } = this.state;

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
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
              <p className="text-[#B8E6EE]">Request time off and track your leave balance</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                <User size={24} className="text-[#087684]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{user.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-200">
            {this.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => this.setState({ activeTab: tab.id as any })}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#087684] border-b-2 border-[#087684]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* New Request Tab */}
            {activeTab === 'request' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Plus size={24} className="text-[#087684]" />
                  <h2 className="text-2xl font-bold text-gray-900">Submit Leave Request</h2>
                </div>

                <form onSubmit={this.handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={(e) => this.setState({ leaveType: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                        required
                      >
                        <option value="">Select leave type</option>
                        {this.leaveTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <div
                        className={`p-3 rounded-lg border ${
                          this.calculateLeaveDays() > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-green-600" />
                          <span className="font-medium text-gray-900">
                            {this.calculateLeaveDays()} day{this.calculateLeaveDays() !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => this.setState({ startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => this.setState({ endDate: e.target.value })}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
                    <textarea
                      value={reason}
                      onChange={(e) => this.setState({ reason: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684] h-32"
                      placeholder="Please provide a brief explanation for your leave request..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !user}
                    className="w-full bg-[#087684] text-white py-3 px-6 rounded-lg hover:bg-[#066466] disabled:bg-[#6B7280] transition-colors font-semibold flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Leave Request
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Leave Balance Tab */}
            {activeTab === 'balance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays size={24} className="text-[#087684]" />
                  <h2 className="text-2xl font-bold text-gray-900">Leave Balance Overview</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {this.leaveTypeOptions.map((type, index) => (
                    <motion.div
                      key={type.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{type.label}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${type.color}`}>
                          {leaveBalance[type.value.toLowerCase() as keyof LeaveBalance]} days
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Available</span>
                          <span>{leaveBalance[type.value.toLowerCase() as keyof LeaveBalance]} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#087684] h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (leaveBalance[type.value.toLowerCase() as keyof LeaveBalance] / 20) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Request History Tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={24} className="text-[#087684]" />
                    <h2 className="text-2xl font-bold text-gray-900">Leave Request History</h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => this.setState({ searchTerm: e.target.value })}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(e) => this.setState({ filterStatus: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {this.filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg">No leave requests found</p>
                      <p className="text-gray-500">Submit your first leave request to get started</p>
                    </div>
                  ) : (
                    this.filteredRequests.map((req, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-gray-900 text-lg">{req.leaveType} Leave</h3>
                              {(() => {
                                const statusInfo = this.getLeaveStatusDisplay(req);
                                const Icon = statusInfo.icon;
                                return (
                                  <div
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                                  >
                                    <Icon size={16} />
                                    {statusInfo.label}
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Start Date</p>
                                <p className="font-medium">{new Date(req.startDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">End Date</p>
                                <p className="font-medium">{new Date(req.endDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-medium">
                                  {Math.ceil(
                                    (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  ) + 1}{' '}
                                  days
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-1">Reason</p>
                              <p className="text-gray-800">{req.reason}</p>
                            </div>

                            {/* Report Button */}
                            {req.status === 'approved' &&
                              !req.actualReturnDate &&
                              (() => {
                                const end = new Date(req.endDate);
                                const today = new Date();
                                const timeAfterEnd = today.getTime() - end.getTime();
                                return timeAfterEnd > 0 && timeAfterEnd <= this.GRACE_PERIOD_MS;
                              })() && (
                                <div className="mt-4">
                                  <button
                                    onClick={() => this.handleReportClick(req._id!)}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                      loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    }`}
                                  >
                                    {loading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                    ) : (
                                      <>
                                        <FileCheck size={16} />
                                        Report
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                            {/* Actual Return Info */}
                            {req.actualReturnDate && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  Actual Return Date: {new Date(req.actualReturnDate).toLocaleDateString()}
                                </p>
                                {req.report && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600">Report:</p>
                                    <p className="text-gray-800">{req.report}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                  messageType === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : messageType === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {messageType === 'success' && <CheckCircle size={20} />}
                {messageType === 'error' && <AlertCircle size={20} />}
                {messageType === 'info' && <AlertCircle size={20} />}
                <p className="font-medium">{statusMessage}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
}

export default LeaveSection;