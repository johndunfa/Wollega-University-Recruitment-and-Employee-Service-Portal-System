'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import EditJobPost from '@/app/dashboard/hr-manager/EditJobPost';

interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  deadline: string;
  createdAt: string;
}

const ManageJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setJobs(jobs.filter(job => job._id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  if (editingJobId) {
    return (
      <EditJobPost
        jobId={editingJobId}
        onClose={() => {
          setEditingJobId(null);
          fetchJobs(); // Refresh the list after editing
        }}
      />
    );
  }

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Job Posts</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Department</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Deadline</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id} className="border-t border-gray-200">
                <td className="px-4 py-3 text-sm text-gray-800">{job.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.department}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.location}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(job.deadline).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingJobId(job._id)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageJobs;