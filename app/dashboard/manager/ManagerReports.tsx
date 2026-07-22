'use client';

import React, { useState } from 'react';

type ReportType =
  | 'progress'
  | 'project-status'
  | 'performance'
  | 'risks'
  | 'resource'
  | 'attendance'
  | 'hiring-needs'
  | 'training'
  | 'retrospective'
  | '';

interface GeneratedReport {
  title: string;
  period: string;
  content: string;
}

const ManagerReports = () => {
  const [reportType, setReportType] = useState<ReportType>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  const teamName = 'Engineering Team';
  const managerName = 'Alex Morgan';
  const reportPeriod = `${dateRange.start || 'Start'} – ${dateRange.end || 'Present'}`;

  // === FETCH: Attendance & Leave Report ===
  const fetchLeaveReport = async () => {
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
        throw new Error(error || 'Failed to fetch leave data');
      }

      const  { data } = await res.json();

      const currentLeaves = data.leaves.filter((l: any) => l.workStatus === 'On Leave');
      const pendingCount = data.summary.status.Pending;
      const approvedCount = data.summary.status.Approved;
      const reportedCount = data.summary.startWorkStatus.reported;

      let content = `
        <p><strong>Team:</strong> ${teamName}</p>
        <p><strong>Reporting Period:</strong> ${reportPeriod}</p>
        <p><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</p>

        <h4 class="font-semibold mt-4">📋 Leave Summary</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>Total Requests:</strong> ${data.summary.total}</li>
          <li><strong>Approved:</strong> ${approvedCount}</li>
          <li><strong>Pending Approval:</strong> ${pendingCount}</li>
          <li><strong>Currently On Leave:</strong> ${currentLeaves.length}</li>
        </ul>
      `;

      if (currentLeaves.length === 0) {
        content += `<p>No team members are currently on leave.</p>`;
      } else {
        content += `
          <h4 class="font-semibold mt-4">👥 Team Members Currently On Leave</h4>
          <ul class="list-disc pl-5 space-y-1">
        `;
        currentLeaves.forEach((leave: any) => {
          content += `
            <li>
              <strong>${leave.employeeName}</strong> (${leave.leaveType}) 
              from ${leave.startDate} to ${leave.endDate}
              ${leave.reason ? `(Reason: ${leave.reason})` : ''}
            </li>
          `;
        });
        content += `</ul>`;
      }

      content += `
        <h4 class="font-semibold mt-4">✅ Reported Back</h4>
        <p><strong>Employees who returned to work:</strong> ${reportedCount}</p>

        <h4 class="font-semibold mt-4">🟡 Action Items</h4>
        <ul class="list-disc pl-5 space-y-1">
          ${pendingCount > 0 ? `<li>Review ${pendingCount} pending leave requests</li>` : ''}
          ${currentLeaves.length > 0
            ? `<li>Ensure coverage for ongoing tasks (e.g., assign backups)</li>`
            : ''
          }
        </ul>
      `;

      setGeneratedReport({
        title: 'Team Attendance & Leave Report',
        period: reportPeriod,
        content,
      });
    } catch (err: any) {
      console.error('Fetch error (Leave Report):', err);
      setError(err.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  // === FETCH: Hiring Needs Report ===
  const fetchHiringNeedsReport = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const url = new URL('/api/reports/hiring-needs', window.location.origin);
      url.searchParams.append('department', 'Engineering');
      if (dateRange.start) url.searchParams.append('start', dateRange.start);
      if (dateRange.end) url.searchParams.append('end', dateRange.end);

      const res = await fetch(url.toString(), { cache: 'no-store' });

      if (!res.ok) {
        const  { error } = await res.json();
        throw new Error(error || 'Failed to fetch hiring data');
      }

      const  { data } = await res.json();

      let content = `
        <p><strong>Department:</strong> ${data.department}</p>
        <p><strong>Analysis Period:</strong> ${data.period}</p>

        <h4 class="font-semibold mt-4">📊 Hiring Metrics</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>Recent Hires (Last 3 Months):</strong> ${data.metrics.hiredCount}</li>
          <li><strong>Open Applications:</strong> ${data.metrics.openApplications}</li>
          <li><strong>Open Positions:</strong> ${data.metrics.openPositions}</li>
          <li><strong>Growth Rate:</strong> ${data.metrics.growthRate} hires/month</li>
        </ul>

        <h4 class="font-semibold mt-4">🔍 Workload Analysis</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>Hiring Trend:</strong> ${data.analysis.hiringTrend}</li>
          <li><strong>Demand Signal:</strong> ${data.analysis.demandSignal}</li>
          <li><strong>Coverage Gap:</strong> ${data.analysis.coverageGap}</li>
        </ul>

        <h4 class="font-semibold mt-4">💡 Recommendation</h4>
        <p><strong>Status:</strong> 
          <span class="px-2 py-1 rounded-full text-sm ${
            data.urgency === '🔴 High'
              ? 'bg-red-100 text-red-800'
              : data.urgency === '🟡 Medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          }">
            ${data.urgency}
          </span>
        </p>
        <p>${data.recommendation}</p>
      `;

      const actionItems = [];
      if (data.metrics.openPositions > 0) {
        actionItems.push('Publish job ads for open roles');
      }
      if (data.metrics.openApplications > 5) {
        actionItems.push('Schedule interviews this week');
      }
      if (data.urgency === '🔴 High') {
        actionItems.push('Escalate to HR for fast-track hiring');
      }

      if (actionItems.length > 0) {
        content += `<h4 class="font-semibold mt-4">🔧 Action Items</h4><ul class="list-disc pl-5 space-y-1">`;
        actionItems.forEach(item => {
          content += `<li>${item}</li>`;
        });
        content += `</ul>`;
      }

      setGeneratedReport({
        title: 'Hiring Needs Report',
        period: reportPeriod,
        content,
      });
    } catch (err: any) {
      console.error('Fetch error (Hiring Needs):', err);
      setError(err.message || 'Failed to load hiring needs data');
    } finally {
      setLoading(false);
    }
  };

  // === FETCH: Training & Development Report ===
  const fetchTrainingReport = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const url = new URL('/api/reports/training', window.location.origin);
      if (dateRange.start) url.searchParams.append('start', dateRange.start);
      if (dateRange.end) url.searchParams.append('end', dateRange.end);

      const res = await fetch(url.toString(), { cache: 'no-store' });

      if (!res.ok) {
        const  { error } = await res.json();
        throw new Error(error || 'Failed to fetch training data');
      }

      const  { data } = await res.json();

      let content = `
        <p><strong>Reporting Period:</strong> ${reportPeriod}</p>
        <p><strong>Total Trainings:</strong> ${data.summary.totalEvents}</p>
        <p><strong>Employees Trained:</strong> ${data.summary.totalParticipants}</p>

        <h4 class="font-semibold mt-4">📊 Training Summary</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div class="p-3 bg-blue-50 rounded border border-blue-200">
            <strong>Total</strong><br/>${data.summary.totalEvents}
          </div>
          <div class="p-3 bg-green-50 rounded border border-green-200">
            <strong>Completed</strong><br/>${data.summary.completed}
          </div>
          <div class="p-3 bg-yellow-50 rounded border border-yellow-200">
            <strong>Upcoming</strong><br/>${data.summary.upcoming}
          </div>
          <div class="p-3 bg-purple-50 rounded border border-purple-200">
            <strong>Participants</strong><br/>${data.summary.totalParticipants}
          </div>
        </div>

        <h4 class="font-semibold mt-6">📈 Skills Developed</h4>
        <div class="space-y-1">
      `;

      Object.entries(data.summary.skillCounts).forEach(([skill, count]) => {
        content += `<div class="flex justify-between text-sm"><span>${skill}</span><span class="font-medium">${count}</span></div>`;
      });

      content += `</div>`;

      if (data.completedEvents.length > 0) {
        content += `<h4 class="font-semibold mt-6">✅ Completed Trainings</h4><ul class="list-disc pl-5 space-y-1">`;
        data.completedEvents.forEach((e: any) => {
          content += `
            <li>
              <strong>${e.title}</strong> (${e.topic}) on ${e.date}
              <br/><span class="text-sm">Trainer: ${e.trainer} | Participants: ${e.participants}</span>
            </li>
          `;
        });
        content += `</ul>`;
      }

      if (data.upcomingEvents.length > 0) {
        content += `<h4 class="font-semibold mt-6">📅 Upcoming Trainings</h4><ul class="list-disc pl-5 space-y-1">`;
        data.upcomingEvents.forEach((e: any) => {
          content += `
            <li>
              <strong>${e.title}</strong> (${e.topic}) on ${e.date}
              <br/><span class="text-sm">Trainer: ${e.trainer} | Participants: ${e.participants}</span>
            </li>
          `;
        });
        content += `</ul>`;
      }

      const needsMore = data.summary.completed < 3;
      const skillGaps = Object.keys(data.summary.skillCounts).length < 3;

      if (needsMore || skillGaps) {
        content += `<h4 class="font-semibold mt-6">⚠️ Recommendations</h4><ul class="list-disc pl-5 space-y-1">`;
        if (needsMore) content += `<li>Plan more training sessions (less than 3 completed)</li>`;
        if (skillGaps) content += `<li>Expand training topics to cover skill gaps</li>`;
        content += `</ul>`;
      }

      setGeneratedReport({
        title: 'Training & Development Report',
        period: reportPeriod,
        content,
      });
    } catch (err: any) {
      console.error('Fetch error (Training):', err);
      setError(err.message || 'Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  // === Generate Mock Reports ===
  const generateMockReport = () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    setTimeout(() => {
      let title = '';
      let content = '';

      switch (reportType) {
        case 'progress':
          title = 'Weekly Progress Report';
          content = `
            <p><strong>Team:</strong> ${teamName}</p>
            <p><strong>Period:</strong> ${reportPeriod}</p>
            <h4 class="font-semibold mt-4">✅ Completed</h4>
            <ul class="list-disc pl-5"><li>Feature X delivered</li></ul>
            <h4 class="font-semibold mt-4">⚠️ Blockers</h4>
            <ul class="list-disc pl-5"><li>Waiting on design assets</li></ul>
          `;
          break;
        case 'project-status':
          title = 'Project Status Report';
          content = `
            <p><strong>Status:</strong> 🟡 At Risk</p>
            <p>Launch delayed by 1 week due to API issues.</p>
          `;
          break;
        case 'performance':
          title = 'Team Performance Report';
          content = `<p>On-time delivery: 85%. Top performer: Sarah Kim.</p>`;
          break;
        case 'risks':
          title = 'Risk & Issue Report';
          content = `<p>High-risk item: Third-party API instability.</p>`;
          break;
        case 'resource':
          title = 'Resource Utilization Report';
          content = `<p>James Lee: 52 hrs (overloaded). Recommend task rebalancing.</p>`;
          break;
        case 'retrospective':
          title = 'Sprint Retrospective Report';
          content = `
            <h4 class="font-semibold">✅ What Went Well</h4>
            <ul class="list-disc pl-5"><li>Daily standups were consistent</li></ul>
            <h4 class="font-semibold mt-4">🔧 Improvements</h4>
            <ul class="list-disc pl-5"><li>Start design reviews earlier</li></ul>
          `;
          break;
        default:
          break;
      }

      setGeneratedReport({
        title,
        period: reportPeriod,
        content,
      });
      setLoading(false);
    }, 600);
  };

  // === Generate Report Handler ===
  const handleGenerateReport = () => {
    if (!reportType) {
      setError('Please select a report type.');
      return;
    }
    setError(null);

    switch (reportType) {
      case 'attendance':
        fetchLeaveReport();
        break;
      case 'hiring-needs':
        fetchHiringNeedsReport();
        break;
      case 'training':
        fetchTrainingReport();
        break;
      default:
        generateMockReport();
    }
  };

  // === Print Report ===
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen" id="manager-report">
      <h1 className="text-3xl font-bold text-gray-800">Manager Reports Dashboard</h1>

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
              <option value="progress">Weekly Progress</option>
              <option value="project-status">Project Status</option>
              <option value="performance">Team Performance</option>
              <option value="risks">Risk & Issue Report</option>
              <option value="resource">Resource Utilization</option>
              <option value="attendance">Attendance & Leave (Live)</option>
              <option value="hiring-needs">Hiring Needs (Data-Driven)</option>
              <option value="training">Training & Development (Live)</option>
              <option value="retrospective">Sprint Retrospective</option>
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

        <div>
          <button
            onClick={handleGenerateReport}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            📊 <span>Generate Report</span>
          </button>
        </div>

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
          <p>Select a report type and click <strong>“Generate Report”</strong>.</p>
        </div>
      )}

      {/* Generated Report */}
      {generatedReport && !loading && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{generatedReport.title}</h2>
            <p className="text-gray-600">{generatedReport.period}</p>
          </div>

          <div
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: generatedReport.content }}
          />

          <div className="flex space-x-4 pt-8 border-t">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
            >
              🖨️ Print Report
            </button>
            <button
              onClick={() => setGeneratedReport(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Clear
            </button>
          </div>

          <div className="mt-12 border-t pt-6 text-sm text-gray-500 print:hidden">
            <p>Prepared by: {managerName} | Confidential — Internal Use Only</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReports;