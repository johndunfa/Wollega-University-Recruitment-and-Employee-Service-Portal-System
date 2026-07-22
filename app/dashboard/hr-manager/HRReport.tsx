'use client';

import React, { useState } from 'react';

// === TYPES ===
type ReportType =
  | 'recruitment'
  | 'turnover'
  | 'demographics'
  | 'performance'
  | 'attendance'
  | 'engagement'
  | 'compliance'
  | 'headcount'
  | 'training'
  | 'compensation'
  | '';

interface LeaveRecord {
  id: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Rejected' | 'Pending' | 'Waiting for HR' | 'Waiting for Report';
  startWorkStatus: 'leaved' | 'reported';
  workStatus: 'Upcoming' | 'On Leave' | 'Completed';
  reason: string;
}

interface HireRecord {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  appliedAt: string;
  startDate: string;
  signedAt: string;
}

type GeneratedReport =
  | { title: string; period: string; summary: AttendanceSummary; leaves: LeaveRecord[] }
  | { title: string; period: string; summary: RecruitmentSummary; hires: HireRecord[] }
  | { title: string; period: string; content: string }
  | null;

interface AttendanceSummary {
  total: number;
  status: {
    Approved: number;
    Rejected: number;
    Pending: number;
    'Waiting for HR': number;
    'Waiting for Report': number;
  };
  startWorkStatus: {
    leaved: number;
    reported: number;
  };
  workPeriodStatus: {
    Upcoming: number;
    'On Leave': number;
    Completed: number;
  };
  absenteeismRate: string;
}

interface RecruitmentSummary {
  totalHires: number;
  avgTimeToHire: number;
  hiresByJob: Record<string, number>;
  hiresByMonth: Record<string, number>;
}

// === COMPONENT ===
const HRReports = () => {
  const [reportType, setReportType] = useState<ReportType>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport>(null);
  const [companyName] = useState('InnovateX Solutions');

  // Mock data for non-attendance/recruitment reports
  const mockData = {
    totalEmployees: 187,
    terminations: 5,
    attritionRate: 8.2,
    engagementScore: 4.3,
    openPositions: 14,
    departmentBreakdown: {
      Engineering: 68,
      Sales: 42,
      Marketing: 22,
      HR: 8,
      Finance: 12,
      Support: 35,
    },
    genderBreakdown: { Male: 54, Female: 130, Other: 3 },
    turnoverByDept: {
      Engineering: '12%',
      Sales: '18%',
      Marketing: '5%',
      HR: '0%',
      Finance: '3%',
      Support: '22%',
    },
    trainingCompletion: '94%',
    performanceDist: { Exceeds: 30, Meets: 60, 'Needs Improvement': 10 },
    compensation: {
      avgIncrease: 4.8,
      bonusTotal: 287000,
      benefitsParticipation: { Health: 94, Retirement: 88 },
    },
  };

  // Format date range for display
  const formatPeriod = (period: { start?: string; end?: string }): string => {
    if (!period.start && !period.end) return 'All Time';
    const start = period.start ? new Date(period.start).toLocaleDateString() : 'Start';
    const end = period.end ? new Date(period.end).toLocaleDateString() : 'Now';
    return `${start} – ${end}`;
  };

  // Get report title
  const getReportTitle = (type: ReportType): string => {
    const titles: Record<ReportType, string> = {
      recruitment: 'Recruitment & Hiring Report',
      turnover: 'Turnover & Retention Report',
      demographics: 'Demographics & Diversity Report',
      performance: 'Performance Management Report',
      attendance: 'Attendance & Leave Report',
      engagement: 'Engagement & Satisfaction Report',
      compliance: 'Compliance & Legal Report',
      headcount: 'Headcount & Workforce Planning Report',
      training: 'Training & Development Report',
      compensation: 'Compensation & Benefits Report',
      '': '',
    };
    return titles[type] || 'Report';
  };

  // Fetch Attendance Report
  const fetchAttendanceReport = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const url = new URL('/api/reports/attendance', window.location.origin);
      if (dateRange.start) url.searchParams.append('start', dateRange.start);
      if (dateRange.end) url.searchParams.append('end', dateRange.end);

      const res = await fetch(url.toString(), { cache: 'no-store' });

      if (!res.ok) {
        const  { error } = await res.json();
        throw new Error(error || 'Failed to fetch data');
      }

      const  { data } = await res.json();

      setGeneratedReport({
        title: 'Attendance & Leave Report',
        period: formatPeriod(data.period),
        summary: data.summary,
        leaves: data.leaves as LeaveRecord[],
      });
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Recruitment Report
  const fetchRecruitmentReport = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const url = new URL('/api/reports/recruitment', window.location.origin);
      if (dateRange.start) url.searchParams.append('start', dateRange.start);
      if (dateRange.end) url.searchParams.append('end', dateRange.end);

      const res = await fetch(url.toString(), { cache: 'no-store' });

      if (!res.ok) {
        const  { error } = await res.json();
        throw new Error(error || 'Failed to fetch recruitment data');
      }

      const  { data } = await res.json();

      setGeneratedReport({
        title: 'Recruitment & Hiring Report',
        period: formatPeriod(data.period),
        summary: data.summary,
        hires: data.hires as HireRecord[],
      });
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  };

  // Generate other mock reports
  const generateMockReport = () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    setTimeout(() => {
      const period = formatPeriod({ start: dateRange.start, end: dateRange.end });
      let content = '<p>Data not available.</p>';

      switch (reportType) {
        case 'turnover':
          content = `
            <p>Analysis of employee attrition.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Terminations:</strong> ${mockData.terminations}</li>
              <li><strong>Attrition Rate:</strong> ${mockData.attritionRate}%</li>
              <li><strong>High-Risk Dept:</strong> Support (${mockData.turnoverByDept.Support})</li>
            </ul>
          `;
          break;
        case 'demographics':
          content = `
            <p>Diversity and inclusion metrics.</p>
            <h4 class="font-semibold mt-3">Gender Distribution</h4>
            <ul class="list-disc pl-5 mt-2">
              ${Object.entries(mockData.genderBreakdown)
                .map(([g, c]) => `<li><strong>${g}:</strong> ${c}</li>`)
                .join('')}
            </ul>
            <h4 class="font-semibold mt-3">Departments</h4>
            <ul class="list-disc pl-5 mt-2">
              ${Object.entries(mockData.departmentBreakdown)
                .map(([d, c]) => `<li><strong>${d}:</strong> ${c} employees</li>`)
                .join('')}
            </ul>
          `;
          break;
        case 'performance':
          content = `
            <p>Performance rating distribution.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Exceeds Expectations:</strong> ${mockData.performanceDist.Exceeds}%</li>
              <li><strong>Meets Expectations:</strong> ${mockData.performanceDist.Meets}%</li>
              <li><strong>Needs Improvement:</strong> ${mockData.performanceDist['Needs Improvement']}%</li>
            </ul>
            <p class="mt-3"><em>High-Potential Employees: 24</em></p>
          `;
          break;
        case 'engagement':
          content = `
            <p>Employee engagement survey results.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Engagement Score:</strong> ${mockData.engagementScore} / 5.0</li>
              <li><strong>eNPS:</strong> +42</li>
              <li><strong>Top Feedback:</strong> Career growth, work-life balance</li>
            </ul>
          `;
          break;
        case 'compliance':
          content = `
            <p>HR compliance and audit status.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>I-9 Verification:</strong> 100% completed</li>
              <li><strong>Policy Acknowledgments:</strong> 98% signed</li>
              <li><strong>OSHA Incidents (YTD):</strong> 0</li>
              <li><strong>EEO-1 Ready:</strong> Yes</li>
            </ul>
          `;
          break;
        case 'headcount':
          content = `
            <p>Workforce size and planning.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Total Employees:</strong> ${mockData.totalEmployees}</li>
              <li><strong>Open Positions:</strong> ${mockData.openPositions}</li>
              <li><strong>Planned Hires (Next Quarter):</strong> 20</li>
            </ul>
          `;
          break;
        case 'training':
          content = `
            <p>Learning and development metrics.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Training Completion:</strong> ${mockData.trainingCompletion}</li>
              <li><strong>Certifications Earned:</strong> 37</li>
              <li><strong>Top Courses:</strong> Cybersecurity, Leadership, DEI</li>
            </ul>
          `;
          break;
        case 'compensation':
          content = `
            <p>Pay and benefits overview.</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Avg Salary Increase:</strong> ${mockData.compensation.avgIncrease}%</li>
              <li><strong>Bonus Payout (YTD):</strong> $${mockData.compensation.bonusTotal.toLocaleString()}</li>
              <li><strong>Benefits Participation:</strong> 
                Health (${mockData.compensation.benefitsParticipation.Health}%), 
                Retirement (${mockData.compensation.benefitsParticipation.Retirement}%)
              </li>
            </ul>
          `;
          break;
        default:
          break;
      }

      setGeneratedReport({
        title: getReportTitle(reportType),
        period,
        content,
      });
      setLoading(false);
    }, 600);
  };

  // Generate report on button click
  const handleGenerateReport = () => {
    if (!reportType) {
      setError('Please select a report type.');
      return;
    }
    setError(null);

    if (reportType === 'attendance') {
      fetchAttendanceReport();
    } else if (reportType === 'recruitment') {
      fetchRecruitmentReport();
    } else {
      generateMockReport();
    }
  };

  // Print the report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen" id="hr-report">
      <h1 className="text-3xl font-bold text-gray-800">HR Reports Dashboard</h1>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Report Type *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose a Report --</option>
              <option value="recruitment">Recruitment & Hiring</option>
              <option value="attendance">Attendance & Leave</option>
              <option value="turnover">Turnover & Retention</option>
              <option value="demographics">Demographics & Diversity</option>
              <option value="performance">Performance Management</option>
              <option value="engagement">Engagement & Satisfaction</option>
              <option value="compliance">Compliance & Legal</option>
              <option value="headcount">Headcount & Planning</option>
              <option value="training">Training & Development</option>
              <option value="compensation">Compensation & Benefits</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={handleGenerateReport}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            📊 <span>Generate Report</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Generating report...</span>
        </div>
      )}

      {/* No Report */}
      {!generatedReport && !loading && (
        <div className="text-center py-16 text-gray-500">
          <p>Select a report type and date range, then click <strong>“Generate Report”</strong>.</p>
        </div>
      )}

      {/* Attendance Report */}
      {generatedReport && !loading && 'leaves' in generatedReport && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{generatedReport.title}</h2>
            <p className="text-gray-600">{generatedReport.period}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Total</h3>
              <p className="text-xl font-bold text-blue-900">{generatedReport.summary.total}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Approved</h3>
              <p className="text-xl font-bold text-green-900">{generatedReport.summary.status.Approved}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
              <p className="text-xl font-bold text-yellow-900">{generatedReport.summary.status.Pending}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <h3 className="text-sm font-medium text-red-800">Rejected</h3>
              <p className="text-xl font-bold text-red-900">{generatedReport.summary.status.Rejected}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-800">Leaved</h3>
              <p className="text-xl font-bold text-indigo-900">{generatedReport.summary.startWorkStatus.leaved}</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
              <h3 className="text-sm font-medium text-teal-800">Reported Back</h3>
              <p className="text-xl font-bold text-teal-900">{generatedReport.summary.startWorkStatus.reported}</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Work Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedReport.leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{leave.employeeName}</td>
                    <td className="px-6 py-4 text-sm">{leave.department}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{leave.startDate}</td>
                    <td className="px-6 py-4 text-sm">{leave.endDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        leave.workStatus === 'On Leave' ? 'bg-orange-100 text-orange-800' :
                        leave.workStatus === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {leave.workStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        leave.startWorkStatus === 'leaved' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {leave.startWorkStatus === 'leaved' ? 'Leaved' : 'Reported'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex space-x-4 pt-8 border-t">
            <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              🖨️ Print Report
            </button>
            <button onClick={() => setGeneratedReport(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Recruitment Report */}
      {generatedReport && !loading && 'hires' in generatedReport && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{generatedReport.title}</h2>
            <p className="text-gray-600">{generatedReport.period}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Total Hires</h3>
              <p className="text-2xl font-bold text-blue-900">{generatedReport.summary.totalHires}</p>
            </div>
            <div className="p-5 bg-green-50 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Avg Time to Hire</h3>
              <p className="text-2xl font-bold text-green-900">{generatedReport.summary.avgTimeToHire} days</p>
            </div>
            <div className="p-5 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800">Roles Filled</h3>
              <p className="text-2xl font-bold text-purple-900">{Object.keys(generatedReport.summary.hiresByJob).length}</p>
            </div>
            <div className="p-5 bg-orange-50 rounded-lg border border-orange-100">
              <h3 className="text-sm font-medium text-orange-800">Active Months</h3>
              <p className="text-2xl font-bold text-orange-900">{Object.keys(generatedReport.summary.hiresByMonth).length}</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time to Hire</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedReport.hires.map((hire) => (
                  <tr key={hire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{hire.fullName}</td>
                    <td className="px-6 py-4 text-sm">{hire.jobTitle}</td>
                    <td className="px-6 py-4 text-sm">{hire.department}</td>
                    <td className="px-6 py-4 text-sm">{hire.appliedAt}</td>
                    <td className="px-6 py-4 text-sm">{hire.startDate}</td>
                    <td className="px-6 py-4 text-sm">{hire.signedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Hires by Job Title</h3>
            {Object.entries(generatedReport.summary.hiresByJob).map(([job, count]) => (
              <div key={job} className="flex justify-between text-sm">
                <span>{job}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-700">Hires by Month</h3>
            {Object.entries(generatedReport.summary.hiresByMonth)
              .sort()
              .map(([month, count]) => (
                <div key={month} className="flex justify-between text-sm">
                  <span>{month}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>

          <div className="flex space-x-4 pt-8 border-t">
            <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              🖨️ Print Report
            </button>
            <button onClick={() => setGeneratedReport(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Other Reports */}
      {generatedReport && !loading && !('leaves' in generatedReport) && !('hires' in generatedReport) && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{generatedReport.title}</h2>
            <p className="text-gray-600">{generatedReport.period}</p>
          </div>
          <div
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: generatedReport.content }}
          />
          <div className="flex space-x-4 pt-8 border-t">
            <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              🖨️ Print Report
            </button>
            <button onClick={() => setGeneratedReport(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRReports;