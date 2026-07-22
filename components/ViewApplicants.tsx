'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Users, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface JobPosting {
  _id: string;
  title: string;
  department: string;
  location: string;
  createdAt: string;
  deadline: string;
  description: string;
}

const ViewApplicants = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState({
    jobs: true,
    checkingApplicants: false
  });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch job postings');
        const data = await response.json();
        setJobPostings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setLoading(prev => ({ ...prev, jobs: false }));
      }
    };

    fetchJobPostings();
  }, []);

 const handleViewCandidates = async (job: JobPosting) => {
    try {
      // Check if applicants exist first
      const response = await fetch(`/api/applications/count?jobTitle=${encodeURIComponent(job.title)}`);
      if (!response.ok) throw new Error('Failed to check applicants');
      
      const { count } = await response.json();
      if (count === 0) {
        alert('No applicants found for this job posting');
        return;
      }

      // Redirect with all job details
      router.push(
        `/score-resume?jobId=${job._id}` +
        `&jobTitle=${encodeURIComponent(job.title)}` +
        `&jobDescription=${encodeURIComponent(job.description)}` +
        `&department=${encodeURIComponent(job.department)}` +
        `&location=${encodeURIComponent(job.location)}`
      );
    } catch (error) {
      console.error('Error checking applicants:', error);
      alert('Error checking applicants. Please try again.');
    }
  };

  if (loading.jobs) return <div className="text-center py-8">Loading jobs...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Job Postings</h2>

      {jobPostings.length === 0 ? (
        <p className="text-gray-500">No job postings available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPostings.map(job => (
            <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Briefcase className="w-6 h-6 text-[#087684] mr-3" />
                  <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p><span className="font-medium">Department:</span> {job.department}</p>
                  <p><span className="font-medium">Location:</span> {job.location}</p>
                  <p><span className="font-medium">Posted:</span> {new Date(job.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Closes:</span> {new Date(job.deadline).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleViewCandidates(job)}
                  disabled={loading.checkingApplicants}
                  className="w-full flex items-center justify-center gap-2 bg-[#087684] hover:bg-[#065b66] disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition"
                >
                  <Users className="w-4 h-4" />
                  {loading.checkingApplicants ? 'Checking...' : 'View Candidates'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;