// components/GenerateCredentials.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Download, Mail, UserCheck, Hash } from 'lucide-react';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
}

interface IdConfig {
  _id: string;
  role: string;
  prefix: string;
  nextNumber: number;
}

const GenerateCredentials = () => {
  const [jobs, setJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [credentials, setCredentials] = useState<{[key: string]: {employeeId: string, password: string}}>({});

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      const hiredCandidates = candidates.filter(candidate => 
        candidate.jobTitle === selectedJob && candidate.status === 'hired'
      );
      setFilteredCandidates(hiredCandidates);
    } else {
      setFilteredCandidates([]);
    }
  }, [selectedJob, candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/candidates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      
      if (data.success) {
        setCandidates(data.candidates);
        
        // Extract unique job titles from hired candidates only
        const hiredCandidates = data.candidates.filter((candidate: Candidate) => 
          candidate.status === 'hired'
        );
        
        const uniqueJobTitles = Array.from(
          new Set(hiredCandidates.map((candidate: Candidate) => candidate.jobTitle).filter(Boolean))
        ) as string[];
        
        setJobs(uniqueJobTitles.sort());
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateEmployeeIds = async () => {
    if (filteredCandidates.length === 0) {
      alert('No hired candidates found for the selected job');
      return;
    }

    setGenerating(true);
    try {
      // Get the ID configuration for employees
      const idConfigResponse = await fetch('/api/id-config');
      const idConfigs = await idConfigResponse.json();

      if (!Array.isArray(idConfigs)) {
        throw new Error('Invalid response from ID configuration API');
      }

      // Find employee configuration or use defaults
      let employeeConfig = idConfigs.find((config: IdConfig) => config.role === 'employee');
      
      if (!employeeConfig) {
        // Create default employee configuration if it doesn't exist
        const createResponse = await fetch('/api/id-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'employee',
            prefix: 'EMP',
            nextNumber: 1001
          })
        });
        
        employeeConfig = await createResponse.json();
      }

      let nextNumber = employeeConfig.nextNumber;

      const newCredentials: {[key: string]: {employeeId: string, password: string}} = {};
      
      filteredCandidates.forEach(candidate => {
        const employeeId = `${employeeConfig.prefix}${nextNumber.toString().padStart(4, '0')}`;
        const password = generateTemporaryPassword();
        newCredentials[candidate._id] = { employeeId, password };
        nextNumber++;
      });

      setCredentials(newCredentials);

      // Update the ID configuration in the database
      await fetch('/api/id-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'employee',
          prefix: employeeConfig.prefix,
          nextNumber: nextNumber
        })
      });

      alert('Employee IDs generated successfully!');
    } catch (error) {
      console.error('Error generating employee IDs:', error);
      alert('Failed to generate employee IDs');
    } finally {
      setGenerating(false);
    }
  };

  // In your sendCredentials function, update the API endpoint:
const sendCredentials = async (candidateId: string) => {
  setSending(true);
  try {
    const candidate = filteredCandidates.find(c => c._id === candidateId);
    const credential = credentials[candidateId];

    if (!candidate || !credential) {
      throw new Error('Candidate or credential not found');
    }

    console.log('Creating user for:', candidate.email);

    // Use the add-users endpoint instead of users endpoint
    const userResponse = await fetch('/api/add-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: credential.employeeId,
        email: candidate.email,
        role: 'employee',
        fullName: candidate.name,
        department: candidate.jobTitle || 'General',
        // Add any additional fields your add-users endpoint expects
      })
    });

    const responseData = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error('API Error response:', responseData);
      throw new Error(responseData.message || `Failed to create user account (${userResponse.status})`);
    }

    console.log('User created successfully with temporary password');

    // The add-users endpoint already sends email, so you don't need to do it here
    alert(`User account created for ${candidate.name}! Temporary password sent to ${candidate.email}`);
    
  } catch (error) {
    console.error('Error in sendCredentials:', error);
    alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setSending(false);
  }
};

  const sendAllCredentials = async () => {
    if (Object.keys(credentials).length === 0) {
      alert('Please generate employee IDs first');
      return;
    }

    setSending(true);
    try {
      const results = [];
      
      for (const candidateId of Object.keys(credentials)) {
        try {
          await sendCredentials(candidateId);
          results.push({ candidateId, success: true });
        } catch (error) {
          results.push({ 
            candidateId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Show summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed > 0) {
        alert(`Processed ${successful} successfully, ${failed} failed. Check console for details.`);
        console.log('Failed operations:', results.filter(r => !r.success));
      } else {
        alert(`All ${successful} credentials processed successfully!`);
      }
    } catch (error) {
      console.error('Error in sendAllCredentials:', error);
      alert('Failed to process all credentials');
    } finally {
      setSending(false);
    }
  };

  const downloadCredentialsCSV = () => {
    if (Object.keys(credentials).length === 0) {
      alert('No credentials to download');
      return;
    }

    let csvContent = 'Name,Email,Employee ID,Password,Job Title\n';
    
    filteredCandidates.forEach(candidate => {
      const credential = credentials[candidate._id];
      if (credential) {
        csvContent += `"${candidate.name}","${candidate.email}","${credential.employeeId}","${credential.password}","${candidate.jobTitle}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-credentials-${selectedJob}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Login Credentials</h2>
        
        {/* Job Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Job Title
          </label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-[#087684]"
          >
            <option value="">Select a Job</option>
            {jobs.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={generateEmployeeIds}
            disabled={!selectedJob || filteredCandidates.length === 0 || generating}
            className="bg-[#087684] hover:bg-[#066466] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Hash size={16} />
            {generating ? 'Generating...' : 'Generate Employee IDs'}
          </button>

          {Object.keys(credentials).length > 0 && (
            <>
              <button
                onClick={sendAllCredentials}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                {sending ? 'Sending...' : 'Send All Credentials'}
              </button>

              <button
                onClick={downloadCredentialsCSV}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={16} />
                Download CSV
              </button>
            </>
          )}
        </div>

        {/* Candidates List */}
        {selectedJob && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hired Candidates for {selectedJob} ({filteredCandidates.length})
            </h3>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No hired candidates found for this job</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate._id}>
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
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {credentials[candidate._id]?.employeeId || 'Not generated'}
                        </td>
                        <td className="px-6 py-4">
                          {credentials[candidate._id] ? (
                            <button
                              onClick={() => sendCredentials(candidate._id)}
                              disabled={sending}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Mail size={14} />
                              Send
                            </button>
                          ) : (
                            <span className="text-sm text-gray-500">Generate IDs first</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateCredentials;