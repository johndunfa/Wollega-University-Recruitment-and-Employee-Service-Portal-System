'use client';

import React, { useState, useEffect } from 'react';
import { Building, Users, UserCheck, Save, ChevronDown, Search } from 'lucide-react';

interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  managerId?: string;
}

interface Manager {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  employeesManaged?: string[];
}

const AssignDepartments = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  // Fetch employees and managers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees
        const employeesResponse = await fetch('/api/employees');
        if (!employeesResponse.ok) {
          throw new Error('Failed to fetch employees');
        }
        const employeesData: Employee[] = await employeesResponse.json();
        
        // Fetch managers
        const managersResponse = await fetch('/api/managers');
        if (!managersResponse.ok) {
          throw new Error('Failed to fetch managers');
        }
        const managersData: Manager[] = await managersResponse.json();
        
        setEmployees(employeesData);
        setManagers(managersData);
        
        // Initialize assignments with current manager assignments
        const initialAssignments: Record<string, string> = {};
        employeesData.forEach((employee: Employee) => {
          if (employee.managerId) {
            initialAssignments[employee._id] = employee.managerId;
          }
        });
        setAssignments(initialAssignments);
        
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle assignment changes
  const handleAssignmentChange = (employeeId: string, managerId: string) => {
    setAssignments(prev => ({
      ...prev,
      [employeeId]: managerId
    }));
  };

  // Save assignments
  const saveAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/assign-managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save assignments');
      }
      
      setSuccess('Manager assignments updated successfully!');
      
      // Update the employees data with the new assignments
      const updatedEmployees = employees.map(employee => ({
        ...employee,
        managerId: assignments[employee._id] || employee.managerId
      }));
      
      setEmployees(updatedEmployees);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while saving';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))];

  // Filter employees based on search term and department filter - FIXED
  const filteredEmployees = employees.filter(employee => {
    // Safely handle potentially undefined/null values
    const name = employee.fullName || '';
    const email = employee.email || '';
    const employeeId = employee.employeeId || '';
    const department = employee.department || '';
    
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get managers by department
  const getManagersByDepartment = (department: string) => {
    return managers.filter(manager => manager.department === department);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#087684]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Department Management</h2>
        <button
          onClick={saveAssignments}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066466] disabled:opacity-50"
        >
          <Save size={18} className="mr-2" />
          Save Assignments
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Employees</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684] appearance-none"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assign Manager
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No employees found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const departmentManagers = getManagersByDepartment(employee.department || '');
                  const currentManager = managers.find(m => m._id === assignments[employee._id]);
                  
                  return (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                            <UserCheck size={20} className="text-[#087684]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.fullName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{employee.email || 'N/A'}</div>
                            <div className="text-xs text-gray-400">ID: {employee.employeeId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.position || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentManager ? currentManager.fullName : 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative">
                          <select
                            value={assignments[employee._id] || ''}
                            onChange={(e) => handleAssignmentChange(employee._id, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#087684] focus:border-[#087684] sm:text-sm rounded-md"
                          >
                            <option value="">Select a manager</option>
                            {departmentManagers.map(manager => (
                              <option key={manager._id} value={manager._id}>
                                {manager.fullName} ({manager.position})
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Assignment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map(dept => {
            const deptEmployees = employees.filter(emp => emp.department === dept);
            const assignedCount = deptEmployees.filter(emp => assignments[emp._id]).length;
            
            return (
              <div key={dept} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{dept}</span>
                  <span className="text-xs bg-[#087684] text-white px-2 py-1 rounded-full">
                    {assignedCount}/{deptEmployees.length}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#087684] h-2 rounded-full" 
                    style={{ width: `${(assignedCount / deptEmployees.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssignDepartments;