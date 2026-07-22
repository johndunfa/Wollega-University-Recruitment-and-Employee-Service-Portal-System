'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, MapPin, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface JobData {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string;
  description: string;
  requirements: string[] | string;
  responsibilities: string[] | string;
  benefits: string[] | string;
  applicationDeadline: string;
  status: string;
}

interface EditJobPostProps {
  jobId: string;
  onClose: () => void;
}

const EditJobPost: React.FC<EditJobPostProps> = ({ jobId, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    applicationDeadline: '',
    status: 'Active'
  });

  // Fetch job data
  useEffect(() => {
    // EditJobPost.tsx - Update the fetchJobData function
const fetchJobData = async () => {
  try {
    setLoading(true);
    setError('');
    const response = await fetch(`/api/jobs/${jobId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch job data');
    }
    
    const jobData = await response.json();
    
    setFormData({
      title: jobData.title || '',
      department: jobData.department || '',
      location: jobData.location || '',
      employmentType: jobData.employmentType || 'Full-time',
      experienceLevel: jobData.experienceLevel || 'Mid-level',
      salaryRange: jobData.salaryRange || '',
      description: jobData.description || '',
      requirements: Array.isArray(jobData.requirements) ? 
        jobData.requirements.join('\n') : jobData.requirements || '',
      responsibilities: Array.isArray(jobData.responsibilities) ? 
        jobData.responsibilities.join('\n') : jobData.responsibilities || '',
      benefits: Array.isArray(jobData.benefits) ? 
        jobData.benefits.join('\n') : jobData.benefits || '',
      applicationDeadline: jobData.applicationDeadline ? 
        jobData.applicationDeadline : '',
      status: jobData.status || 'Active'
    });
  } catch (err: any) {
    setError(err.message || 'Failed to load job data');
    console.error('Error fetching job:', err);
  } finally {
    setLoading(false);
  }
};

    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(item => item.trim() !== ''),
        responsibilities: formData.responsibilities.split('\n').filter(item => item.trim() !== ''),
        benefits: formData.benefits.split('\n').filter(item => item.trim() !== '')
      };

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update job');
      }

      setSuccess('Job updated successfully!');
      
      // Refresh the page or close the modal after a short delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#087684]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Job Post</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type *
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>

          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level *
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            >
              <option value="Entry-level">Entry-level</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div>
            <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-1">
              Salary Range
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                id="salaryRange"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                placeholder="e.g., $80,000 - $100,000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline *
            </label>
            <input
              type="date"
              id="applicationDeadline"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            placeholder="Describe the role, company culture, and what makes this position unique..."
          />
        </div>

        <div>
          <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-1">
            Key Responsibilities (one per line) *
          </label>
          <textarea
            id="responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            placeholder="• Develop and maintain web applications\n• Collaborate with cross-functional teams\n• Write clean, efficient code"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Requirements (one per line) *
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            placeholder="• 5+ years of experience in software development\n• Proficiency in JavaScript and React\n• Bachelor's degree in Computer Science or related field"
          />
        </div>

        <div>
          <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
            Benefits (one per line)
          </label>
          <textarea
            id="benefits"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087684] focus:border-transparent"
            placeholder="• Health insurance\n• Flexible working hours\n• Professional development budget"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#087684] text-white rounded-lg hover:bg-[#066466] transition-colors flex items-center disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPost;