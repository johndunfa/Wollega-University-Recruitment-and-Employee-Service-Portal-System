'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, FileText, Clock, Eye, Download } from 'lucide-react';

interface Applicant {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  portfolio?: string;
  jobId: string;
  jobTitle: string;
  resumeUrl: string;
  appliedAt: string;
  status: string;
}

const RankedApplicants = () => {
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Fetch unique job titles
  useEffect(() => {
    const fetchJobTitles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/applications`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch job titles: ${res.status}`);
        }

        const data: Applicant[] = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        const titles = [...new Set(data.map(app => app.jobTitle).filter(Boolean))].sort();
        setJobTitles(titles);

        if (titles.length > 0) {
          setSelectedJobTitle(titles[0]);
        } else {
          setError('No job titles found.');
        }
      } catch (err: any) {
        console.error('Fetch job titles error:', err);
        setError(err.message || 'Could not load job titles.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobTitles();
  }, [BASE_URL]);

  // Fetch applicants for selected job
  useEffect(() => {
    if (!selectedJobTitle) {
      setApplicants([]);
      return;
    }

    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BASE_URL}/api/applications?jobTitle=${encodeURIComponent(selectedJobTitle)}`,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch applicants: ${res.status}`);
        }

        const data: Applicant[] = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid applicant data format');
        }

        setApplicants(data);
      } catch (err: any) {
        console.error('Fetch applicants error:', err);
        setError(err.message || 'Could not load applicants.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [selectedJobTitle, BASE_URL]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Applicants List</h2>

      {/* Job Title Dropdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
          Select Job Position
        </label>
        <select
          id="jobTitle"
          value={selectedJobTitle}
          onChange={(e) => setSelectedJobTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>
            -- Choose a job --
          </option>
          {jobTitles.length === 0 ? (
            <option disabled>No jobs available</option>
          ) : (
            jobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))
          )}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {!selectedJobTitle && !loading && (
        <div className="text-center py-12 text-gray-500">
          <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a job to view applicants.</p>
        </div>
      )}

      {selectedJobTitle && !loading && applicants.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No applicants for "{selectedJobTitle}" yet.</p>
        </div>
      )}

      {selectedJobTitle && applicants.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900">
              Applicants for: <span className="text-blue-600">{selectedJobTitle}</span>
            </h3>
            <p className="text-sm text-gray-600">{applicants.length} applicant(s)</p>
          </div>
          <div className="divide-y divide-gray-100">
            {applicants.map((app) => (
              <div key={app._id} className="p-6 hover:bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{app.fullName}</h4>
                    <p className="text-gray-600">{app.email}</p>
                    <p className="text-gray-500 text-sm">Phone: {app.phone}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {app.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <strong>Cover Letter:</strong>{' '}
                      {app.coverLetter.length > 120
                        ? app.coverLetter.substring(0, 120) + '...'
                        : app.coverLetter}
                    </p>
                    {app.portfolio && (
                      <p>
                        <strong>Portfolio:</strong>{' '}
                        <a
                          href={app.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open Link
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </a>
                      <a
                        href={app.resumeUrl}
                        download
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RankedApplicants;
