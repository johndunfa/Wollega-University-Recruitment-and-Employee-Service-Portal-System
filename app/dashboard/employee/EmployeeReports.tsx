'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Briefcase,
  Users,
  Shield,
  BookOpen,
  UserCheck,
  Building2,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Simplified card with hover effect
const TiltedCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`transition-all duration-300 hover:scale-102 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
};

// Report interface
interface Report {
  id: string;
  title: string;
  type: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  date: string;
  lastUpdated: Date;
  content: string;
}

// Status color mapping
const statusColors = {
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

// Map of report types to icons
const typeIcons: Record<string, React.ElementType> = {
  'Performance': TrendingUp,
  'Timesheet & Attendance': Clock,
  'Payroll': FileText,
  'HR Analytics': Users,
  'Engagement Survey': MessageSquare,
  'Training & Development': BookOpen,
  'Leave & Absence': UserCheck,
  'Onboarding': Building2,
  'Disciplinary': Shield,
  'Org Chart': Building2,
  'Compliance': Shield,
  'Self-Service': FileText,
};

// Suggested titles for each report type
const titleSuggestions: Record<string, string[]> = {
  'Performance': [
    'Quarterly Performance Review',
    'Annual Employee Evaluation',
    'Team Performance Summary',
    'Individual Development Plan',
  ],
  'Timesheet & Attendance': [
    'Weekly Timesheet Summary',
    'Monthly Attendance Report',
    'Overtime Tracking Report',
    'Late Arrival & Absence Log',
  ],
  'Payroll': [
    'Monthly Payroll Register',
    'Tax Withholding Summary',
    'Net Pay Distribution Report',
    'Year-to-Date Earnings Summary',
  ],
  'HR Analytics': [
    'Employee Turnover Report',
    'Time-to-Hire Analysis',
    'Diversity & Inclusion Metrics',
    'Retention Rate Dashboard',
  ],
  'Engagement Survey': [
    'Q3 Employee Satisfaction Report',
    'Pulse Survey Results',
    'Workplace Culture Assessment',
    'eNPS & Feedback Summary',
  ],
  'Training & Development': [
    'Training Completion Report',
    'Skill Gap Analysis',
    'Certification Tracker',
    'Learning ROI Summary',
  ],
  'Leave & Absence': [
    'Vacation Balance Summary',
    'Sick Leave Usage Report',
    'Parental Leave Tracker',
    'Unscheduled Absence Analysis',
  ],
  'Onboarding': [
    'New Hire Onboarding Status',
    'Onboarding Task Completion',
    '30-Day Feedback Summary',
    'Orientation Progress Report',
  ],
  'Disciplinary': [
    'Incident Report - [Employee Name]',
    'Disciplinary Action Log',
    'HR Investigation Summary',
    'Code of Conduct Violation Report',
  ],
  'Org Chart': [
    'Departmental Organizational Chart',
    'Team Structure & Reporting Lines',
    'Current Staffing Levels',
    'Role & Responsibility Map',
  ],
  'Compliance': [
    'OSHA Safety Incident Report',
    'EEO-1 Report Summary',
    'FMLA Leave Compliance Log',
    'Workplace Policy Acknowledgment',
  ],
  'Self-Service': [
    'My Pay Stub - October 2024',
    'Tax Form (W-2) Preview',
    'Leave Balance Statement',
    'Benefits Enrollment Summary',
  ],
};

// Fallback content generator for non-dynamic report types
const generateContent = (type: string, title: string): string => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const templates: Record<string, string> = {
    'Performance': `**Quarterly Performance Report: ${title}**\n\n**Employee:** Jane Doe\n**Department:** Engineering\n**Review Period:** Q3 2024\n**Rating:** 4.7 / 5.0\n\n**Key Achievements:**\n- Delivered 12 high-impact features\n- Mentored 2 junior devs\n- Improved API speed by 40%\n\n**KPIs Met:** 95%\n**Feedback:** Strong collaboration\n\n**Goals:** Lead cross-team project\n\n*Reviewed on ${date}.*`,

    'Payroll': `**Monthly Payroll Register - October 2024**\n\n**Employee ID:** EMP-1082\n**Pay Period:** Oct 1 – Oct 31\n\n**Earnings:**\n- Base: $5,000.00\n- Bonus: $500.00\n\n**Deductions:**\n- Tax: $1,170.00\n- Insurance: $180.00\n- 401k: $375.00\n\n**Net Pay:** $4,775.00\n\n*Paid Nov 1, 2024.*`,

    'HR Analytics': `**Employee Turnover Report - Q3 2024**\n\n**Start:** 150 employees\n**End:** 147 employees\n**Exits:** 6 (5 voluntary)\n**Turnover Rate:** 4.0%\n\n**Top Reasons:** Better opportunity, relocation\n\n**Action:** Mentorship program in Q4.`,

    'Engagement Survey': `**Q3 Employee Satisfaction**\n\n**Response Rate:** 89%\n**eNPS:** 42 (Good)\n\n**Findings:**\n- 85% feel valued\n- 68% see growth\n\n**Plan:** Pilot hybrid work policy.`,

    'Onboarding': `**New Hire Onboarding - Michael Torres**\n\n**Start Date:** Oct 1, 2024\n\n**Completed:**\n✅ Orientation\n✅ IT Setup\n✅ HR Paperwork\n\n**Pending:**\n🟡 Brand Training (Oct 15)\n\n**Feedback:** "Onboarding was smooth."`,

    'Disciplinary': `**Incident Report**\n\n**Employee:** Robert Chen\n**Date:** ${date}\n\n**Summary:** Heated argument during meeting, violating Code of Conduct.\n\n**Action:** Verbal warning + workshop.\n\n**Witnesses:** Lisa Park, Tom Reed`,

    'Org Chart': `**Engineering Dept - Q4 2024**\n\n**Director:** Emma Thompson\n├── **Lead Engineer:** James Lee\n│   ├── Frontend (4)\n│   └── Backend (5)\n└── **QA Manager:** Nina Patel\n    └── QA Team (3)\n\n**Open Roles:** 2`,

    'Compliance': `**OSHA Safety Report**\n\n**Incident ID:** INC-2024-101\n**Date:** ${date}\n\n**Summary:** Employee slipped on wet floor. Minor sprain.\n\n**Root Cause:** Delayed cleanup.\n\n**Action:** Retrain staff, add signs.`,

    'Self-Service': `**My Pay Stub - October 2024**\n\n**Gross Pay:** $4,200.00\n**Deductions:** $1,145.00\n**Net Pay:** $3,055.00\n\n**Leave Balance:**\n- Vacation: 14 days\n- Sick: 6 days\n\n*Generated on ${date}*`,
  };

  return templates[type] || `**${title}**\n\nThis ${type} was generated on ${date}.\n\nNo further content available.`;
};

const EmployeeReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState<string>('Performance');
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');

  // Auto-fill first title suggestion when type changes
  useEffect(() => {
    const suggestions = titleSuggestions[reportType];
    setSelectedTitle(suggestions?.[0] || `My ${reportType} Report`);
    setCustomTitle('');
  }, [reportType]);

  // Fetch data from API
  const fetchData = async (type: string, employeeId: string) => {
    try {
      const res = await fetch(`/api/reports/employee-data?type=${type}&employeeId=${employeeId}`);
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
      return [];
    }
  };

  const handleGenerateReport = async () => {
    const titleToUse = customTitle.trim() || selectedTitle.trim();
    if (!titleToUse) {
      alert('Please enter or select a report title.');
      return;
    }

    // Get employeeId from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const employeeId = user?.employeeId;

    if (!employeeId) {
      alert('User not logged in. Please log in first.');
      return;
    }

    setIsGenerating(true);
    let content = '';

    try {
      if (reportType === 'Timesheet & Attendance') {
        const data = await fetchData('attendance', employeeId);
        const totalHours = data.reduce((sum: number, a: any) => sum + (a.hoursWorked || 0), 0);
        const absences = data.filter((a: any) => a.status === 'Absent').length;

        content = `**Weekly Attendance Report**\n\n**Employee ID:** ${employeeId}\n**Period:** Last 30 Days\n\n**Summary:**\n- Days Worked: ${data.length}\n- Total Hours: ${totalHours.toFixed(1)}\n- Absences: ${absences}\n\n**Recent Log:**\n${data.slice(0, 5).map((a: any) => 
          `- ${new Date(a.date).toLocaleDateString()}: ${a.status} (${a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : 'N/A'} → ${a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : 'N/A'})`
        ).join('\n')}\n\n*Generated on ${new Date().toLocaleDateString()}.*`;
      }
      else if (reportType === 'Training & Development') {
        const data = await fetchData('training', employeeId);
        const completed = data.filter((t: any) => t.status === 'Completed').length;
        const skills = [...new Set(data.flatMap((t: any) => t.skillsGained || []))].join(', ');

        content = `**Training & Development Report**\n\n**Employee ID:** ${employeeId}\n\n**Summary:**\n- Completed: ${completed}\n- Skills Gained: ${skills || 'Not specified'}\n\n**Courses:**\n${data.map((t: any) => 
          `- ${t.courseName} (${t.provider || 'N/A'}) - ${t.status} (${new Date(t.startDate).toLocaleDateString()} → ${t.endDate ? new Date(t.endDate).toLocaleDateString() : 'Ongoing'})`
        ).join('\n')}\n\n*Generated on ${new Date().toLocaleDateString()}.*`;
      }
      else if (reportType === 'Leave & Absence') {
        const data = await fetchData('leave', employeeId);
        const approved = data.filter((l: any) => l.status === 'Approved').length;
        const pending = data.filter((l: any) => l.status === 'Pending').length;

        content = `**Leave & Absence Report**\n\n**Employee ID:** ${employeeId}\n\n**Summary:**\n- Approved: ${approved}\n- Pending: ${pending}\n\n**History:**\n${data.map((l: any) => 
          `- ${l.type}: ${new Date(l.startDate).toLocaleDateString()} → ${new Date(l.endDate).toLocaleDateString()} (${l.status})${l.reason ? ` - ${l.reason}` : ''}`
        ).join('\n')}\n\n*Generated on ${new Date().toLocaleDateString()}.*`;
      }
      else {
        content = generateContent(reportType, titleToUse);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      content = `**${titleToUse}**\n\n⚠️ Could not load real data. Using sample content.\n\n${generateContent(reportType, titleToUse)}`;
    }

    // Simulate brief delay
    setTimeout(() => {
      const newReport: Report = {
        id: Date.now().toString(),
        title: titleToUse,
        type: reportType,
        status: 'Draft',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        lastUpdated: new Date(),
        content,
      };

      setReports([newReport, ...reports]);
      setActiveReport(newReport);
      setIsGenerating(false);
    }, 800);
  };

  const filteredReports = reports.filter((report) => {
    const matchesFilter = filter === 'all' || report.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewReport = (report: Report) => {
    setActiveReport(report);
  };

  const handleBack = () => {
    setActiveReport(null);
  };

  // Helper to convert Markdown to minimal HTML (bold, line breaks, lists)
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')           // **bold**
      .replace(/\n- /g, '<br/>• ')                               // List bullets
      .replace(/^\- /, '• ')                                     // First bullet
      .replace(/\n/g, '<br/>')                                   // Line breaks
      .replace(/✅/g, '<span class="text-green-600">✅</span>')   // Emoji styling
      .replace(/🟡/g, '<span class="text-yellow-500">🟡</span>')
      .replace(/❗/g, '<span class="text-red-500">❗</span>');

    return { __html: html };
  };

  return (
    <div className="space-y-6 p-6 bg-[#F8FAFB] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-col lg:items-start lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1C1E]">Employee Reports</h1>
          <p className="text-[#6B7280]">Generate and manage official employee reports</p>
        </div>

        {/* Generator Form */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-6">
           <h3 className="text-lg font-semibold text-[#1C1C1E] mb-5">Generate New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684]"
              >
                {Object.keys(titleSuggestions).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Dropdown */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Select Title</label>
              <select
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684]"
              >
                {titleSuggestions[reportType]?.map((title, idx) => (
                  <option key={idx} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#087684] text-white rounded-lg hover:bg-[#066466] disabled:bg-gray-400 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] bg-white"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Report List or Detail View */}
      {!activeReport ? (
        <div className="grid gap-6">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl shadow border border-[#E5E7EB]">
              <FileText size={48} className="mx-auto text-[#9CA3AF] mb-4" />
              <h3 className="text-xl font-medium text-[#1C1C1E] mb-2">No reports yet</h3>
              <p className="text-[#6B7280]">Generate your first report using the panel above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => {
                const Icon = typeIcons[report.type] || FileText;
                return (
                  <TiltedCard key={report.id} className="bg-white p-6 rounded-xl shadow border border-[#E5E7EB]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
                          <Icon size={20} className="text-[#087684]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1C1C1E]">{report.title}</h3>
                          <p className="text-sm text-[#6B7280]">{report.type}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[report.status]}`}>
                        {report.status}
                      </span>
                    </div>

                    <p
                      className="text-sm text-[#6B7280] line-clamp-3 mb-4"
                      dangerouslySetInnerHTML={renderMarkdown(report.content.split('\n')[1] || 'Report generated successfully.')}
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#F8FAFB] text-[#1C1C1E] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-[#F8FAFB] text-[#1C1C1E] rounded-lg hover:bg-[#F3F4F6] transition-colors">
                        <Download size={16} />
                        <span>Export</span>
                      </button>
                    </div>
                  </TiltedCard>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Display Generated Report */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-[#087684] hover:text-[#066466] mb-6 transition-colors"
          >
            ← <span>Back to Reports</span>
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C1E]">{activeReport.title}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-[#6B7280]">
                <span>{activeReport.type}</span>
                <span>•</span>
                <span>{activeReport.date}</span>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[activeReport.status]}`}>
              {activeReport.status}
            </span>
          </div>

          <div
            className="text-[#1C1C1E] leading-relaxed text-sm"
            dangerouslySetInnerHTML={renderMarkdown(activeReport.content)}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="px-6 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors flex items-center space-x-2">
              <Download size={16} />
              <span>Download PDF</span>
            </button>
            <button className="px-6 py-2 border border-[#E5E7EB] text-[#1C1C1E] rounded-lg hover:bg-[#F3F4F6] transition-colors">
              Print
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EmployeeReports;