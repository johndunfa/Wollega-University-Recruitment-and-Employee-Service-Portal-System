'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Search, X, User, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

export default function SendCredentials() {
  const [searchMethod, setSearchMethod] = useState<'name' | 'id'>('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [emailSubject, setEmailSubject] = useState(
    'Your Login Credentials - WU Portal'
  )
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Fetch users dynamically from your API
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()

        const mappedUsers: User[] = data.map((user: any) => ({
          id: user._id,
          name: user.employeeId, // use employeeId as name
          email: user.email,
          role: user.role,
          department: user.role, // fallback to role for department
        }))

        setUsers(mappedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([])
      return
    }

    const filtered = users.filter(user => {
      if (searchMethod === 'name') {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return user.id.toLowerCase().includes(searchTerm.toLowerCase())
      }
    })

    setSearchResults(filtered.slice(0, 5))
  }, [searchTerm, searchMethod, users])

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchTerm('')
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId))
  }

  const handleClearSelection = () => {
    setSelectedUsers([])
  }

  const handleSendCredentials = async () => {
    if (selectedUsers.length === 0) return

    setIsSending(true)
    try {
      const response = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers.map(user => user.id),
          subject: emailSubject,
        }),
      })

      if (response.ok) {
        setSendSuccess(true)
        setSelectedUsers([])
        setTimeout(() => setSendSuccess(false), 3000)
      } else {
        throw new Error('Failed to send credentials')
      }
    } catch (error) {
      console.error('Error sending credentials:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">
          Send Login Credentials
        </h2>
        <p className="text-[#6B7280]">
          Send login credentials to employees via email
        </p>
      </div>

      {/* Email Form */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-[#087684] to-[#066466]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Send Credentials
              </h3>
              <p className="text-white/80 text-sm">
                Send login credentials to selected users
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* User Selection */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium mb-6">Select Recipients</h4>

              {/* Search Method */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 bg-[#FAFBFC] rounded-xl flex justify-between items-center"
                >
                  {searchMethod === 'name'
                    ? 'Search by Name'
                    : 'Search by Employee ID'}
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full bg-white border rounded-lg mt-1"
                    >
                      <button
                        onClick={() => {
                          setSearchMethod('name')
                          setDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Search by Name
                      </button>
                      <button
                        onClick={() => {
                          setSearchMethod('id')
                          setDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Search by Employee ID
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={`Enter ${
                    searchMethod === 'name' ? 'name' : 'employee ID'
                  }`}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFBFC]"
                />

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center"
                      >
                        <User size={16} className="mr-3" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email Settings */}
            <div>
              <h4 className="text-lg font-medium mb-6">Email Settings</h4>
              <input
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFC]"
              />
            </div>
          </div>

          {/* Selected Users */}
          <div className="mt-8 border-t pt-6">
            {selectedUsers.map(user => (
              <div
                key={user.id}
                className="flex justify-between p-3 border rounded-lg mb-2"
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <button onClick={() => handleRemoveUser(user.id)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleClearSelection}
              disabled={!selectedUsers.length}
              className="px-6 py-3 bg-gray-100 rounded-xl"
            >
              Clear Selection
            </button>

            <button
              onClick={handleSendCredentials}
              disabled={!selectedUsers.length || isSending}
              className="px-8 py-3 bg-gradient-to-r from-[#087684] to-[#066466] text-white rounded-xl"
            >
              {isSending ? 'Sending...' : 'Send Credentials'}
            </button>
          </div>

          {sendSuccess && (
            <div className="mt-4 text-green-600 flex items-center">
              <Check size={16} className="mr-2" />
              Credentials sent successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
