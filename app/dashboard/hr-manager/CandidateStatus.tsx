'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Target
} from 'lucide-react';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumeScore: number;
  qualificationScore?: number;
  interviewScore?: number;
  documentScore?: number;
  totalScore?: number;
  status: 'pass' | 'fail' | 'pending' | 'new' | 'hired';
  appliedDate: string;
  location: string;
  jobId: string;
  jobTitle: string;
}

interface Job {
  title: string;
  count: number;
  passMark?: number;
}

const CandidateStatus = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending' | 'new' | 'hired'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassMarkModal, setShowPassMarkModal] = useState(false);
  const [passMarkValue, setPassMarkValue] = useState<number>(0);

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [selectedJob, searchTerm, statusFilter, candidates]);

  const fetchAllCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/candidates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        const formattedCandidates = data.candidates.map((candidate: any) => ({
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          resumeUrl: candidate.resumeUrl,
          resumeScore: candidate.resumeScore || candidate.score || 0,
          qualificationScore: candidate.qualificationScore,
          interviewScore: candidate.interviewScore,
          documentScore: candidate.documentScore,
          totalScore: candidate.totalScore,
          status: candidate.status || 'new',
          appliedDate: candidate.appliedDate,
          location: candidate.location,
          jobId: candidate.jobId,
          jobTitle: candidate.jobTitle
        }));
        
        setCandidates(formattedCandidates);
        
        // Group candidates by job title and count them
        const jobMap = new Map();
        formattedCandidates.forEach((candidate: Candidate) => {
          if (candidate.jobTitle) {
            const normalizedTitle = candidate.jobTitle.trim();
            if (jobMap.has(normalizedTitle)) {
              const jobData = jobMap.get(normalizedTitle);
              jobMap.set(normalizedTitle, {
                ...jobData,
                count: jobData.count + 1
              });
            } else {
              jobMap.set(normalizedTitle, {
                title: normalizedTitle,
                count: 1,
                passMark: 0 // Initialize with default value
              });
            }
          }
        });
        
        // Convert to array of job objects
        const jobList = Array.from(jobMap.values()).sort((a, b) => a.title.localeCompare(b.title));
        
        setJobs(jobList);
      } else {
        throw new Error(data.error || 'Failed to fetch candidates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
      setCandidates([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    // Filter by selected job title
    if (selectedJob) {
      filtered = filtered.filter(candidate => 
        candidate.jobTitle && candidate.jobTitle.trim() === selectedJob
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    setFilteredCandidates(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'fail':
        return <XCircle size={16} className="text-red-600" />;
      case 'pending':
      case 'new':
        return <Clock size={16} className="text-yellow-600" />;
      case 'hired':
        return <Briefcase size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateCandidateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          field: 'status',
          value: newStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        setCandidates(prev => prev.map(candidate =>
          candidate._id === candidateId
            ? { ...candidate, status: newStatus as 'pass' | 'fail' | 'pending' | 'new' | 'hired' }
            : candidate
        ));
        
        alert('Candidate status updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating candidate status:', err);
      alert('Failed to update candidate status');
    }
  };

  const hireCandidate = async (candidateId: string) => {
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          field: 'status',
          value: 'hired'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCandidates(prev => prev.map(candidate =>
          candidate._id === candidateId
            ? { ...candidate, status: 'hired' }
            : candidate
        ));
        
        alert('Candidate hired successfully!');
      } else {
        throw new Error(data.error || 'Failed to hire candidate');
      }
    } catch (err) {
      console.error('Error hiring candidate:', err);
      alert('Failed to hire candidate');
    }
  };

  const setupPassMark = async () => {
  if (!selectedJob) {
    alert('Please select a job first');
    return;
  }

  try {
    // Save pass mark for the selected job
    const response = await fetch('/api/passmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle: selectedJob,
        passMark: passMarkValue
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update jobs with the new pass mark
      setJobs(prev => prev.map(job => 
        job.title === selectedJob 
          ? { ...job, passMark: passMarkValue } 
          : job
      ));
      
      // Update candidate statuses based on the pass mark
      const updatePromises: Promise<void>[] = [];
      const updatedCandidates = candidates.map(candidate => {
        if (candidate.jobTitle === selectedJob && candidate.totalScore !== undefined) {
          const newStatus = candidate.totalScore >= passMarkValue ? 'pass' as const : 'fail' as const;
          if (candidate.status !== newStatus) {
            // Update status in the backend
            updatePromises.push(updateCandidateStatus(candidate._id, newStatus));
            return { ...candidate, status: newStatus };
          }
        }
        return candidate;
      });
      
      // Wait for all status updates to complete
      await Promise.all(updatePromises);
      setCandidates(updatedCandidates);
      setShowPassMarkModal(false);
      alert(`Pass mark set to ${passMarkValue}% for ${selectedJob}. Candidate statuses updated.`);
    } else {
      throw new Error(data.error || 'Failed to set pass mark');
    }
  } catch (err) {
    console.error('Error setting pass mark:', err);
    alert('Failed to set pass mark');
  }
};

  // Helper function to safely display scores
  const displayScore = (score: any) => {
    if (score === undefined || score === null || score === 0) return 'N/A';
    return `${score}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#087684]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidate Status</h2>
          <p className="text-gray-600">Track and manage candidate application status</p>
        </div>
        
        {selectedJob && jobs.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg">
              <span className="font-medium">Selected Job: </span>
              {selectedJob}
              <span className="ml-2 text-blue-600">
                ({filteredCandidates.length} candidates)
              </span>
            </div>
            <button
              onClick={() => setShowPassMarkModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Target size={16} />
              Setup Pass Mark
            </button>
            <button
              onClick={() => {
                const passedCandidates = filteredCandidates.filter(c => c.status === 'pass');
                if (passedCandidates.length === 0) {
                  alert('No passed candidates to hire for this job');
                  return;
                }
                if (confirm(`Hire ${passedCandidates.length} passed candidates for ${selectedJob}?`)) {
                  passedCandidates.forEach(candidate => hireCandidate(candidate._id));
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Briefcase size={16} />
              Hire Candidates
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pass Mark Modal */}
      {showPassMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Pass Mark for {selectedJob}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pass Mark (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={passMarkValue}
                onChange={(e) => setPassMarkValue(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                placeholder="Enter pass mark percentage"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPassMarkModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={setupPassMark}
                className="px-4 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066466]"
              >
                Set Pass Mark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Job Title
            </label>
            <div className="relative">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684] appearance-none"
                disabled={loading || jobs.length === 0}
              >
                <option value="">All Jobs</option>
                {jobs && jobs.map((job) => (
                  <option key={job.title} value={job.title}>
                    {job.title} ({job.count})
                    {job.passMark ? ` - Pass: ${job.passMark}%` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {jobs.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">No jobs found in candidate data</p>
            )}
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Candidates
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
                disabled={candidates.length === 0}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684] appearance-none"
                disabled={candidates.length === 0}
              >
                <option value="all">All Status</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="pending">Pending</option>
                <option value="new">New</option>
                <option value="hired">Hired</option>
              </select>
              <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="bg-gray-50 p-3 rounded-lg w-full">
              <p className="text-sm text-gray-600">Showing</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredCandidates.length} {selectedJob ? 'filtered' : 'total'} candidates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#087684]"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates found</h3>
            <p className="mt-2 text-gray-500">
              There are no candidates in the database yet
            </p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates match your filters</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-[#087684] to-[#066466] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {candidate.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail size={14} className="mr-2 text-gray-400" />
                            {candidate.email || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Award size={16} className="mr-2 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {displayScore(candidate.resumeScore)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Award size={16} className="mr-2 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {displayScore(candidate.documentScore)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Award size={16} className="mr-2 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {displayScore(candidate.interviewScore)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Award size={16} className="mr-2 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {displayScore(candidate.totalScore)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={candidate.status}
                        onChange={(e) => updateCandidateStatus(candidate._id, e.target.value)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status)} border-none focus:ring-2 focus:ring-[#087684]`}
                      >
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateStatus;