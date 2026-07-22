"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Search,
  Filter,
  User,
  Building2,
  Check,
  X,
  Eye,
} from "lucide-react"

interface Employee {
  name?: string
  employeeId: string
  email?: string
  role: string
  position?: string
  department?: string
}

interface LeaveRequestData {
  _id?: string
  employeeId: string
  employeeName?: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: string
  submittedAt?: string
  approvedBy?: string
  managerComments?: string
}

const ManagerDashboard = () => {
  const [user, setUser] = useState<Employee | null>(null)
  const [allRequests, setAllRequests] = useState<LeaveRequestData[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [filterStatus, setFilterStatus] = useState("waiting_for_hr")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestData | null>(null)
  const [managerComments, setManagerComments] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
          setStatusMessage("You are not logged in. Please login to access manager dashboard.")
          setMessageType("error")
          return
        }

        const parsedUser = JSON.parse(storedUser)
        const { employeeId, name, role } = parsedUser

        if (role !== "manager" && role !== "admin" && role !== "hr-manager") {
          setStatusMessage("Access denied. Manager, Admin, or HR-Manager privileges required.")
          setMessageType("error")
          return
        }

        setUser({
          name,
          employeeId,
          role,
          department: "Management",
          position: role,
        })

        setStatusMessage("")
      } catch (error) {
        console.error("Failed to process user data:", error)
        setStatusMessage("Failed to load user data.")
        setMessageType("error")
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (user) {
      fetchAllRequests()
    }
  }, [user])

  const fetchAllRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/hr/leave-requests", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch leave requests")
      }

      const data = await res.json()
      const requests = data.requests || []

      setAllRequests(requests)
    } catch (error) {
      console.error("Failed to fetch leave requests:", error)
      setStatusMessage("Failed to load leave requests.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReject = async (requestId: string, action: "approved" | "rejected", comments = "") => {
    if (!user) return

    setActionLoading(requestId)
    try {
      const res = await fetch("/api/hr/approve-leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          managerId: user.employeeId,
          managerComments: comments,
        }),
      })

      const result = await res.json()

      if (res.ok) {
        setStatusMessage(`Leave request ${action} successfully!`)
        setMessageType("success")
        fetchAllRequests()
        setSelectedRequest(null)
        setManagerComments("")
      } else {
        setStatusMessage(result.message || `Failed to ${action} leave request`)
        setMessageType("error")
      }
    } catch (error) {
      console.error(`Failed to ${action} leave request:`, error)
      setStatusMessage(`Failed to ${action} leave request`)
      setMessageType("error")
    } finally {
      setActionLoading(null)
    }
  }

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle size={16} className="text-green-600" />
      case "rejected":
        return <XCircle size={16} className="text-red-600" />
      case "waiting_for_hr":
        return <Clock size={16} className="text-yellow-600" />
      default:
        return <Clock size={16} className="text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "waiting_for_hr":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusDisplayText = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting_for_hr":
        return "Waiting for HR"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType.toLowerCase()) {
      case "annual":
        return "bg-blue-100 text-blue-800"
      case "sick":
        return "bg-red-100 text-red-800"
      case "casual":
        return "bg-green-100 text-green-800"
      case "emergency":
        return "bg-orange-100 text-orange-800"
      case "vacation":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRequests = allRequests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status.toLowerCase() === filterStatus
    const matchesSearch =
      req.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Count leave statuses
  const waitingForHrCount = allRequests.filter(req => req.status === 'waiting_for_hr').length
  const approvedCount = allRequests.filter(req => req.status === 'approved').length
  const rejectedCount = allRequests.filter(req => req.status === 'rejected').length

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-gray-600 text-lg">Access denied. Manager privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 md:p-6"
    >
      {/* Manager Info with Leave Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F0F9FF] rounded-full flex items-center justify-center">
            <User size={24} className="text-[#087684]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">Manager Dashboard</p>

            {/* Leave Status Summary */}
            <div className="flex items-center gap-8 mt-4 text-sm">
              <div className="text-center">
                <Clock size={18} className="mx-auto text-yellow-600 mb-1" />
                <p className="text-gray-600">Waiting for HR</p>
                <p className="text-lg font-semibold text-yellow-700">{waitingForHrCount}</p>
              </div>
              <div className="text-center">
                <CheckCircle size={18} className="mx-auto text-green-600 mb-1" />
                <p className="text-gray-600">Approved</p>
                <p className="text-lg font-semibold text-green-700">{approvedCount}</p>
              </div>
              <div className="text-center">
                <XCircle size={18} className="mx-auto text-red-600 mb-1" />
                <p className="text-gray-600">Rejected</p>
                <p className="text-lg font-semibold text-red-700">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee, leave type, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684] w-80"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
              >
                <option value="all">All Requests</option>
                <option value="waiting_for_hr">Waiting for HR</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredRequests.length} of {allRequests.length} requests
          </div>
        </div>
      </div>

      {/* Leave Requests Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#087684] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No leave requests found</p>
              <p className="text-gray-500">No requests match your current filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req, idx) => (
                <motion.div
                  key={req._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{req.employeeName || req.employeeId}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLeaveTypeColor(req.leaveType)}`}>
                          {req.leaveType} Leave
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                          {getStatusIcon(req.status)}
                          {getStatusDisplayText(req.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Employee ID</p>
                          <p className="font-medium">{req.employeeId}</p>
                        </div>
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
                          <p className="font-medium">{calculateLeaveDays(req.startDate, req.endDate)} days</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Reason</p>
                        <p className="text-gray-800">{req.reason}</p>
                      </div>

                      {req.managerComments && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Manager Comments</p>
                          <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{req.managerComments}</p>
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        Submitted: {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "N/A"}
                        {req.approvedBy && ` • Approved by: ${req.approvedBy}`}
                      </div>
                    </div>

                    {req.status === "waiting_for_hr" && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="flex items-center gap-2 px-4 py-2 text-[#087684] border border-[#087684] rounded-lg hover:bg-[#087684] hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Review Leave Request</h3>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setManagerComments("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-medium">{selectedRequest.employeeName || selectedRequest.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leave Type</p>
                  <p className="font-medium">{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Reason</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manager Comments (Optional)</label>
                <textarea
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#087684] focus:border-[#087684] h-24"
                  placeholder="Add any comments or feedback..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleApproveReject(selectedRequest._id!, "approved", managerComments)}
                disabled={actionLoading === selectedRequest._id}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
              >
                {actionLoading === selectedRequest._id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Check size={16} />
                )}
                Approve
              </button>
              <button
                onClick={() => handleApproveReject(selectedRequest._id!, "rejected", managerComments)}
                disabled={actionLoading === selectedRequest._id}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold"
              >
                {actionLoading === selectedRequest._id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <X size={16} />
                )}
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setManagerComments("")
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg flex items-center gap-3 shadow-lg ${
            messageType === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : messageType === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          {messageType === "success" && <CheckCircle size={20} />}
          {messageType === "error" && <AlertCircle size={20} />}
          {messageType === "info" && <AlertCircle size={20} />}
          <p className="font-medium">{statusMessage}</p>
          <button onClick={() => setStatusMessage("")} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ManagerDashboard