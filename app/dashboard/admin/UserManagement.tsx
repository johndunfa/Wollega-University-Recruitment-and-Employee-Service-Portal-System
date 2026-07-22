// app/dashboard/admin/UserManagement.tsx
'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'

interface User {
  _id: string
  name: string
  fullName?: string;
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch users on component mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const res = await fetch('/api/users')
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }
        const data = await res.json()
        setUsers(data)
      } catch (err: any) {
        console.error('fetchUsers error:', err)
        alert(`Failed to fetch users: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === '' || user.role === roleFilter
    const matchesDepartment = departmentFilter === '' || user.department === departmentFilter
    
    return matchesSearch && matchesRole && matchesDepartment
  })

  // Get unique roles and departments for filter options
  const uniqueRoles = [...new Set(users.map(user => user.role).filter(Boolean))]
  const uniqueDepartments = [...new Set(users.map(user => user.department).filter(Boolean))]

  // Delete user handler
  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      setUsers(users.filter(user => user._id !== id))
    } catch (err: any) {
      console.error('deleteUser error:', err)
      alert(`Failed to delete user: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8FAFB] rounded-t-lg -mt-6 -mx-6 mb-6">
          <h4 className="text-lg font-semibold text-[#1C1C1E]">System Overview</h4>
          <p className="text-sm text-[#6B7280] mt-1">Key metrics and system status</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card 1 - Total Users */}
          <div className="p-6 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-br hover:from-[#F1F5F9] hover:to-[#E2E8F0] relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">Total Users</p>
                <p className="text-2xl font-bold text-[#1E293B] mt-1">{users.length}</p>
                <p className="text-xs text-[#64748B] mt-1">Active accounts</p>
              </div>
              <div className="w-12 h-12 bg-[#087684] rounded-xl flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats Card 2 - Active Sessions */}
          <div className="p-6 bg-gradient-to-br from-[#FEFCE8] to-[#FEF3C7] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-br hover:from-[#FEF3C7] hover:to-[#FDE68A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">Active Sessions</p>
                <p className="text-2xl font-bold text-[#1E293B] mt-1">24</p>
                <p className="text-xs text-[#64748B] mt-1">Currently online</p>
              </div>
              <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats Card 3 - System Health */}
          <div className="p-6 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-br hover:from-[#DCFCE7] hover:to-[#BBF7D0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">System Health</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">Good</p>
                <p className="text-xs text-[#64748B] mt-1">All systems operational</p>
              </div>
              <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <Filter size={16} className="text-[#6B7280]" />
            <span className="text-[#6B7280]">Filter</span>
          </button>
          <button 
            onClick={() => {/* Navigate to create user */}}
            className="flex items-center space-x-2 bg-[#087684] text-white px-4 py-2 rounded-lg hover:bg-[#066060] transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-[#1C1C1E]">Filter Users</h4>
            <button 
              onClick={() => {
                setRoleFilter('')
                setDepartmentFilter('')
              }}
              className="text-sm text-[#087684] hover:text-[#066060] transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Role</label>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
   
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-[#6B7280]">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <button 
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066060] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFB]">
          <h4 className="text-lg font-semibold text-[#1C1C1E]">User Accounts</h4>
          <p className="text-sm text-[#6B7280] mt-1">Manage system user accounts and permissions</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#087684]"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F8FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                          <Users size={16} className="text-[#087684]" />
                        </div>
                        <div>
                          {/* Always show full name above email if available, otherwise fallback to name */}
                          <div className="font-medium text-[#1C1C1E]">
                            {user.fullName || user.name}
                          </div>
                          <div className="text-sm text-[#6B7280]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0F9FF] text-[#087684]">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-[#6B7280] hover:text-[#087684] transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 text-[#6B7280] hover:text-[#087684] transition-colors">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-1 text-[#6B7280] hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}