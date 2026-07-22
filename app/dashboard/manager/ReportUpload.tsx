'use client';

import React, { useEffect, useState } from 'react';
import { 
  UploadCloud, 
  Download, 
  Eye, 
  FileText, 
  Users, 
  User, 
  Building2,
  Calendar,
  Search,
  Filter,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface User {
  employeeId: string;
  name: string;
  department: string;
}

interface Report {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  uploadedBy?: string;
  uploadedByName?: string;
  reportTitle?: string;
  targetType?: 'employee' | 'department';
  targetEmployeeId?: string;
  targetDepartment?: string;
}

interface Staff {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  email?: string;
  role?: string;
  status?: string;
}

const ReportDashboard: React.FC = () => {
  // Common states
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Employee upload states
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
  const [employeeMessage, setEmployeeMessage] = useState('');
  
  // Manager states
  const [reports, setReports] = useState<Report[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'employee' | 'manager'>('all');
  
  // Manager upload states
  const [managerFile, setManagerFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [targetType, setTargetType] = useState<'employee' | 'department'>('employee');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('User not found in localStorage');
        }

        const parsedUser = JSON.parse(storedUser);
        const employeeId = parsedUser?.employeeId;

        if (!employeeId) throw new Error('Employee ID missing');

        // Get user data
        const res = await fetch('/api/get-user-by-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: employeeId }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await res.json();
        const userData = {
          employeeId: data.employeeId,
          name: data.name,
          department: data.department,
        };
        setUser(userData);

        // If user is a manager, fetch additional data
        if (data.role === 'manager') {
          // Fetch staff in same department
          const staffRes = await fetch('/api/get-staff-by-department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ department: userData.department }),
          });

          if (staffRes.ok) {
            const staffData = await staffRes.json();
            setStaffList(staffData.employees || []);
          }

          // Fetch all reports
          const reportsRes = await fetch('/api/reports');
          if (reportsRes.ok) {
            const reportsData = await reportsRes.json();
            setReports(reportsData.reports || []);
            setFilteredReports(reportsData.reports || []);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Filter reports for manager view
    let filtered = reports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === 'employee') {
      filtered = filtered.filter(report => !report.uploadedBy);
    } else if (filterType === 'manager') {
      filtered = filtered.filter(report => report.uploadedBy);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, filterType, user]);

  // Employee file upload handlers
  const handleEmployeeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setEmployeeFile(e.target.files[0]);
      setEmployeeMessage('');
    }
  };

  const handleEmployeeUpload = async () => {
    if (!employeeFile || !user) {
      setEmployeeMessage('File or user info missing.');
      return;
    }

    const formData = new FormData();
    formData.append('report', employeeFile);
    formData.append('employeeId', user.employeeId);
    formData.append('name', user.name);
    formData.append('department', user.department);

    try {
      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setEmployeeMessage('Report uploaded successfully.');
        setEmployeeFile(null);
        
        // Refresh reports list if user is manager
        if (user && reports.length > 0) {
          const reportsRes = await fetch('/api/reports');
          const reportsData = await reportsRes.json();
          setReports(reportsData.reports || []);
        }
      } else {
        setEmployeeMessage('Failed to upload report.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setEmployeeMessage('An error occurred during upload.');
    }
  };

  // Manager file upload handlers
  const handleManagerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setManagerFile(e.target.files[0]);
      setUploadMessage('');
    }
  };

  const handleManagerUpload = async () => {
    if (!managerFile || !user) {
      setUploadMessage('File or manager info missing.');
      return;
    }

    if (targetType === 'employee' && !selectedEmployee) {
      setUploadMessage('Please select an employee.');
      return;
    }

    if (targetType === 'department' && !selectedDepartment) {
      setUploadMessage('Please select a department.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('report', managerFile);
    formData.append('managerId', user.employeeId);
    formData.append('managerName', user.name);
    formData.append('managerDepartment', user.department);
    formData.append('reportTitle', reportTitle);

    if (targetType === 'employee') {
      formData.append('targetEmployeeId', selectedEmployee);
    } else {
      formData.append('targetDepartment', selectedDepartment);
    }

    try {
      const res = await fetch('/api/reports/manager-upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadMessage('Report uploaded successfully!');
        setManagerFile(null);
        setReportTitle('');
        setSelectedEmployee('');
        setSelectedDepartment('');
        
        // Refresh reports list
        const reportsRes = await fetch('/api/reports');
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      } else {
        setUploadMessage('Failed to upload report.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadMessage('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadReport = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#087684]"></div>
        <p className="ml-3 text-[#6B7280]">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <User size={48} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">User Not Found</h3>
          <p className="text-yellow-600">Please make sure you're logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Reports Dashboard</h2>
        <p className="text-[#6B7280]">Upload and manage your reports</p>
        <div className="mt-2 text-sm text-[#6B7280]">
          {user.name} ({user.employeeId}) | Department: {user.department}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Employee Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UploadCloud size={20} className="text-[#087684]" />
            <h3 className="text-lg font-semibold text-[#1C1C1E]">Upload Your Report</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                Select File
              </label>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center hover:border-[#087684] transition-colors">
                <input
                  type="file"
                  onChange={handleEmployeeFileChange}
                  className="hidden"
                  id="employee-file-upload"
                />
                <label htmlFor="employee-file-upload" className="cursor-pointer">
                  <UploadCloud size={32} className="mx-auto text-[#9CA3AF] mb-2" />
                  <p className="text-[#6B7280]">
                    {employeeFile ? employeeFile.name : 'Click to select a file or drag and drop'}
                  </p>
                  <p className="text-sm text-[#9CA3AF] mt-1">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                </label>
              </div>
              {employeeFile && (
                <div className="mt-2 flex items-center justify-between p-2 bg-[#F0F9FF] rounded-lg">
                  <span className="text-sm text-[#087684]">{employeeFile.name}</span>
                  <button
                    onClick={() => setEmployeeFile(null)}
                    className="text-[#9CA3AF] hover:text-[#087684]"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleEmployeeUpload}
              disabled={!employeeFile}
              className="w-full bg-[#087684] text-white py-3 px-4 rounded-lg hover:bg-[#066466] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              <UploadCloud size={18} />
              <span>Upload Report</span>
            </button>

            {employeeMessage && (
              <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                employeeMessage.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employeeMessage.includes('successfully') ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span className="text-sm">{employeeMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Reports View/Manager Upload */}
        <div className="space-y-6">
          {/* Manager Upload Section (only shown if user is manager) */}
          {staffList.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users size={20} className="text-[#087684]" />
                <h3 className="text-lg font-semibold text-[#1C1C1E]">Manager Upload</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Enter report title or description"
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Target Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="employee"
                        checked={targetType === 'employee'}
                        onChange={(e) => setTargetType(e.target.value as 'employee' | 'department')}
                        className="text-[#087684] focus:ring-[#087684]"
                      />
                      <User size={16} />
                      <span>Specific Employee</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="department"
                        checked={targetType === 'department'}
                        onChange={(e) => setTargetType(e.target.value as 'employee' | 'department')}
                        className="text-[#087684] focus:ring-[#087684]"
                      />
                      <Building2 size={16} />
                      <span>Department</span>
                    </label>
                  </div>
                </div>

                {targetType === 'employee' ? (
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                      Select Employee
                    </label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                    >
                      <option value="">Choose an employee...</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff.employeeId}>
                          {staff.name} ({staff.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                      Select Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                    >
                      <option value="">Choose a department...</option>
                      <option value={user.department}>{user.department}</option>
                      <option value="all">All Departments</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center hover:border-[#087684] transition-colors">
                    <input
                      type="file"
                      onChange={handleManagerFileChange}
                      className="hidden"
                      id="manager-file-upload"
                    />
                    <label htmlFor="manager-file-upload" className="cursor-pointer">
                      <UploadCloud size={32} className="mx-auto text-[#9CA3AF] mb-2" />
                      <p className="text-[#6B7280]">
                        {managerFile ? managerFile.name : 'Click to select a file or drag and drop'}
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                    </label>
                  </div>
                  {managerFile && (
                    <div className="mt-2 flex items-center justify-between p-2 bg-[#F0F9FF] rounded-lg">
                      <span className="text-sm text-[#087684]">{managerFile.name}</span>
                      <button
                        onClick={() => setManagerFile(null)}
                        className="text-[#9CA3AF] hover:text-[#087684]"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleManagerUpload}
                  disabled={uploading || !managerFile}
                  className="w-full bg-[#087684] text-white py-3 px-4 rounded-lg hover:bg-[#066466] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} />
                      <span>Upload Report</span>
                    </>
                  )}
                </button>

                {uploadMessage && (
                  <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                    uploadMessage.includes('successfully') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {uploadMessage.includes('successfully') ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span className="text-sm">{uploadMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports List Section */}
          {reports.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText size={20} className="text-[#087684]" />
                    <h3 className="text-lg font-semibold text-[#1C1C1E]">Your Reports</h3>
                  </div>
                  <span className="text-sm text-[#6B7280]">{filteredReports.length} reports</span>
                </div>
              </div>

              <div className="p-4 border-b border-[#E5E7EB]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                    <h4 className="text-lg font-medium text-[#1C1C1E] mb-2">No Reports Found</h4>
                    <p className="text-[#6B7280]">No reports match your current filters.</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {filteredReports.map((report) => (
                      <div key={report._id} className="p-4 bg-[#FAFBFC] rounded-lg hover:bg-[#F5F7FA] transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText size={16} className="text-[#087684]" />
                              <h4 className="font-medium text-[#1C1C1E]">
                                {report.reportTitle || report.fileName}
                              </h4>
                              {report.uploadedBy && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Manager Upload
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[#6B7280] space-y-1">
                              <p><strong>Uploaded by:</strong> {report.uploadedByName || report.name}</p>
                              <p><strong>Department:</strong> {report.department}</p>
                              <p><strong>Date:</strong> {formatDate(report.uploadedAt)}</p>
                              {report.targetEmployeeId && (
                                <p><strong>Target Employee:</strong> {report.targetEmployeeId}</p>
                              )}
                              {report.targetDepartment && (
                                <p><strong>Target Department:</strong> {report.targetDepartment}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => downloadReport(report.filePath, report.fileName)}
                              className="p-2 text-[#6B7280] hover:text-[#087684] hover:bg-[#F0F9FF] rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => window.open(report.filePath, '_blank')}
                              className="p-2 text-[#6B7280] hover:text-[#087684] hover:bg-[#F0F9FF] rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;