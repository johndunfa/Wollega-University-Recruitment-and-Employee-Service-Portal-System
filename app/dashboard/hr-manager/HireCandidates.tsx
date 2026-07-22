'use client';

import React, { useState, useEffect } from 'react';
import { Download, Mail, Phone, User, FileText, ChevronRight, Search, Building, RefreshCw, AlertCircle } from 'lucide-react';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  applicationDate: string;
  status: 'pending' | 'interviewed' | 'rejected' | 'offered' | 'hired' | 'new' | 'reviewed';
  resumeUrl: string;
  selected: boolean;
  salaryOffer?: string;
  startDate?: string;
  notes?: string;
  rank: number;
  qualificationScore: number;
  experience: string;
  skills: string[];
  interviewScore?: number;
  documentScore?: number;
  totalScore?: number;
}

interface Position {
  _id: string;
  title: string;
  department: string;
  applicants: number;
  hired: number;
  status: 'open' | 'closed' | 'draft';
}

const HireCandidates = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [view, setView] = useState<'positions' | 'candidates'>('positions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Fetch positions from MongoDB
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/jobs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch positions');
        }
        
        const data = await response.json();
        setPositions(data);
        console.log('Positions fetched:', data);
      } catch (err) {
        console.error('Error fetching positions:', err);
        setError('Failed to load positions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  // Helper function to map API status to component status
  const mapStatus = (apiStatus: string): Candidate['status'] => {
    const statusMap: Record<string, Candidate['status']> = {
      'new': 'pending',
      'reviewed': 'interviewed',
      'interview': 'interviewed',
      'rejected': 'rejected',
      'hired': 'hired',
      'pending': 'pending',
      'interviewed': 'interviewed',
      'offered': 'offered'
    };
    
    return statusMap[apiStatus] || 'pending';
  };

  // Fetch candidates when a position is selected
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedPosition) return;

      try {
        setLoading(true);
        console.log('Fetching candidates for position:', selectedPosition.title, 'ID:', selectedPosition._id);
        
        // Try multiple approaches to find candidates
        let candidatesData = [];
        
        // Approach 1: Search by jobId
        const responseById = await fetch(`/api/candidates?jobId=${selectedPosition._id}`);
        if (responseById.ok) {
          const dataById = await responseById.json();
          console.log('API response by ID:', dataById);
          if (dataById.success && Array.isArray(dataById.candidates)) {
            candidatesData = dataById.candidates;
            console.log('Found candidates by jobId:', candidatesData.length);
          }
        }
        
        // Approach 2: If no candidates found by ID, search by job title
        if (candidatesData.length === 0) {
          const responseByTitle = await fetch(`/api/candidates?jobTitle=${encodeURIComponent(selectedPosition.title)}`);
          if (responseByTitle.ok) {
            const dataByTitle = await responseByTitle.json();
            console.log('API response by title:', dataByTitle);
            if (dataByTitle.success && Array.isArray(dataByTitle.candidates)) {
              candidatesData = dataByTitle.candidates;
              console.log('Found candidates by jobTitle:', candidatesData.length);
            }
          }
        }
        
        // Approach 3: Get all candidates if specific search fails
        if (candidatesData.length === 0) {
          const responseAll = await fetch('/api/candidates');
          if (responseAll.ok) {
            const dataAll = await responseAll.json();
            console.log('API response all:', dataAll);
            if (dataAll.success && Array.isArray(dataAll.candidates)) {
              candidatesData = dataAll.candidates;
              console.log('Found all candidates:', candidatesData.length);
            }
          }
        }

        // Store debug info
        setDebugInfo({
          jobId: selectedPosition._id,
          jobTitle: selectedPosition.title,
          candidatesFound: candidatesData.length,
          timestamp: new Date().toISOString(),
          sampleCandidate: candidatesData.length > 0 ? candidatesData[0] : null
        });

        // Map API fields to component fields with comprehensive field name handling
        const mappedCandidates = candidatesData.map((candidate: any, index: number) => {
          // Handle name field variations
          let name = 'Unknown Candidate';
          if (candidate.name) name = candidate.name;
          else if (candidate.fullName) name = candidate.fullName;
          else if (candidate.candidateName) name = candidate.candidateName;
          else if (candidate.firstName && candidate.lastName) name = `${candidate.firstName} ${candidate.lastName}`;
          else if (candidate.firstName) name = candidate.firstName;

          // Handle other field variations
          const email = candidate.email || candidate.emailAddress || '';
          const phone = candidate.phone || candidate.phoneNumber || candidate.contactNumber || '';
          const jobTitle = candidate.jobTitle || candidate.position || candidate.appliedPosition || selectedPosition.title;
          const department = candidate.department || selectedPosition.department;
          
          // Handle date fields
          let appliedDate = new Date().toISOString();
          if (candidate.appliedDate) appliedDate = candidate.appliedDate;
          else if (candidate.applicationDate) appliedDate = candidate.applicationDate;
          else if (candidate.dateApplied) appliedDate = candidate.dateApplied;
          else if (candidate.createdAt) appliedDate = candidate.createdAt;

          const status = mapStatus(candidate.status || 'new');
          const resumeUrl = candidate.resumeUrl || candidate.resume || candidate.cvUrl || '';
          const resumeScore = candidate.resumeScore || candidate.score || candidate.qualificationScore || 0;
          
          let experience = 'Not specified';
          if (candidate.experience) experience = `${candidate.experience} years`;
          else if (candidate.yearsExperience) experience = `${candidate.yearsExperience} years`;
          else if (candidate.experienceLevel) experience = candidate.experienceLevel;

          const skills = candidate.skills || candidate.skillset || candidate.technologies || [];

          return {
            _id: candidate._id || candidate.id || `temp-${index}`,
            name: name,
            email: email,
            phone: phone,
            position: jobTitle,
            department: department,
            applicationDate: appliedDate,
            status: status,
            resumeUrl: resumeUrl,
            selected: false,
            rank: candidate.rank || index + 1,
            qualificationScore: resumeScore,
            experience: experience,
            skills: skills,
            interviewScore: candidate.interviewScore || 0,
            documentScore: candidate.documentScore || 0,
            totalScore: candidate.totalScore || undefined
          };
        });
        
        setCandidates(mappedCandidates);
        console.log('Mapped candidates for display:', mappedCandidates);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedPosition) {
      fetchCandidates();
      setView('candidates');
    }
  }, [selectedPosition]);

  const refreshCandidates = async () => {
    if (!selectedPosition) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/candidates?jobId=${selectedPosition._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      
      const data = await response.json();
      
      let candidatesData = [];
      if (data.success && Array.isArray(data.candidates)) {
        candidatesData = data.candidates;
      }
      
      const mappedCandidates = candidatesData.map((candidate: any, index: number) => {
        // Handle name field variations
        let name = 'Unknown Candidate';
        if (candidate.name) name = candidate.name;
        else if (candidate.fullName) name = candidate.fullName;
        else if (candidate.candidateName) name = candidate.candidateName;
        else if (candidate.firstName && candidate.lastName) name = `${candidate.firstName} ${candidate.lastName}`;
        else if (candidate.firstName) name = candidate.firstName;

        return {
          _id: candidate._id || candidate.id || `temp-${index}`,
          name: name,
          email: candidate.email || candidate.emailAddress || '',
          phone: candidate.phone || candidate.phoneNumber || '',
          position: candidate.jobTitle || candidate.position || selectedPosition.title,
          department: candidate.department || selectedPosition.department,
          applicationDate: candidate.appliedDate || candidate.applicationDate || new Date().toISOString(),
          status: mapStatus(candidate.status || 'new'),
          resumeUrl: candidate.resumeUrl || candidate.resume || '',
          selected: false,
          rank: candidate.rank || index + 1,
          qualificationScore: candidate.resumeScore || candidate.score || 0,
          experience: candidate.experience ? `${candidate.experience} years` : 'Not specified',
          skills: candidate.skills || candidate.skillset || [],
          interviewScore: candidate.interviewScore || 0,
          documentScore: candidate.documentScore || 0,
          totalScore: candidate.totalScore || undefined
        };
      });
      
      setCandidates(mappedCandidates);
    } catch (err) {
      console.error('Error refreshing candidates:', err);
      setError('Failed to refresh candidates. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleInputChange = async (id: string, field: string, value: string | number) => {
    setCandidates(prev =>
      prev.map(candidate =>
        candidate._id === id ? { ...candidate, [field]: value } : candidate
      )
    );

    try {
      const response = await fetch('/api/update-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: id,
          field,
          value
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }
    } catch (err) {
      console.error('Error updating candidate:', err);
      setError('Failed to update candidate. Please try again.');
    }
  };

  // Submit Score function
  const handleSubmitScore = async () => {
    try {
      // Calculate total scores for all candidates
      const candidatesWithTotalScores = candidates.map(candidate => {
        const interviewScore = candidate.interviewScore || 0;
        const documentScore = candidate.documentScore || 0;
        const qualificationScore = candidate.qualificationScore || 0;
        
        // Calculate total score
        const totalScore = qualificationScore + interviewScore + documentScore;
        
        return {
          ...candidate,
          totalScore
        };
      });

      // Send all scores to the backend
      const response = await fetch('/api/update-candidates-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidates: candidatesWithTotalScores.map(candidate => ({
            candidateId: candidate._id,
            interviewScore: candidate.interviewScore || 0,
            documentScore: candidate.documentScore || 0,
            totalScore: candidate.totalScore || 0
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit scores');
      }

      // Update local state with calculated scores
      setCandidates(candidatesWithTotalScores);
      
      alert('Scores submitted successfully!');
    } catch (err) {
      console.error('Error submitting scores:', err);
      setError('Failed to submit scores. Please try again.');
    }
  };

  const handleBackToPositions = () => {
    setSelectedPosition(null);
    setView('positions');
    setCandidates([]);
    setDebugInfo(null);
  };

  // Filter candidates based on search and filters - with safety checks
  const filteredCandidates = candidates
    .filter(candidate => {
      const searchTermLower = searchTerm.toLowerCase();
      const name = candidate.name || '';
      const email = candidate.email || '';
      
      const matchesSearch = name.toLowerCase().includes(searchTermLower) ||
        email.toLowerCase().includes(searchTermLower);
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      const department = candidate.department || '';
      const matchesDepartment = departmentFilter === 'all' || department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => a.rank - b.rank);

  // Filter positions based on search and filters - with safety checks
  const filteredPositions = positions.filter(position => {
    const searchTermLower = searchTerm.toLowerCase();
    const title = position.title || '';
    const department = position.department || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTermLower) ||
      department.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const selectedCount = candidates.filter(c => c.selected).length;

  if (loading && positions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug information */}
    
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hire Candidates</h2>
          <p className="text-sm text-gray-600">
            {view === 'positions' 
              ? 'Select a position to view candidates' 
              : `Candidates for: ${selectedPosition?.title}`}
          </p>
        </div>
        {view === 'candidates' && (
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={refreshCandidates}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              title="Refresh candidates"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-sm text-gray-600">
              {selectedCount} selected of {candidates.length} total
            </span>
            
          </div>
        )}
      </div>

      {view === 'candidates' && (
        <div className="bg-white rounded-lg shadow p-4">
          <button
            onClick={handleBackToPositions}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronRight className="h-5 w-5 rotate-180 mr-1" />
            Back to Positions
          </button>
        </div>
      )}


      {view === 'positions' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPositions.map((position) => (
            <div 
              key={position._id} 
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPosition(position)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  position.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : position.status === 'closed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {position.status}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building className="h-4 w-4 mr-1" />
                {position.department}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{position.applicants}</div>
                  <div className="text-xs text-blue-600">Applicants</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {position.applicants - position.hired} remaining
                </span>
                <button className="text-blue-600 hover:text-blue-800 flex items-center">
                  View candidates
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedPosition?.title} Candidates</h3>
              <p className="text-sm text-gray-600">
                Showing {filteredCandidates.length} of {candidates.length} candidates
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
            <button
              onClick={refreshCandidates}
              disabled={refreshing}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qual Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interview Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate._id} className={candidate.selected ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              candidate.rank === 1 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : candidate.rank === 2
                                ? 'bg-gray-100 text-gray-800'
                                : candidate.rank === 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <span className="font-bold">{candidate.rank}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                              <div className="text-sm text-gray-500">{candidate.phone}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500"
                                style={{ width: `${candidate.qualificationScore}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {candidate.qualificationScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={candidate.interviewScore || ''}
                            onChange={(e) => handleInputChange(candidate._id, 'interviewScore', parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={candidate.documentScore || ''}
                            onChange={(e) => handleInputChange(candidate._id, 'documentScore', parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {candidate.totalScore !== undefined ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {candidate.totalScore}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {((candidate.interviewScore || 0) + (candidate.documentScore || 0) + candidate.qualificationScore)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Score Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleSubmitScore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Score
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Click to calculate and save total scores for all candidates
                </p>
              </div>
            </>
          )}

          {filteredCandidates.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {candidates.length === 0 
                  ? `No candidates have applied for the ${selectedPosition?.title} position yet.`
                  : 'Try adjusting your search or filter to find what you\'re looking for.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HireCandidates;