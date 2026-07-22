'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumeMatcher() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState([]);
  const [message, setMessage] = useState('');
  const [topResumes, setTopResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobDescription || resumes.length === 0) {
      setMessage('Please enter a job description and upload resumes.');
      return;
    }

    setIsLoading(true);
    setMessage('Processing...');

    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      resumes.forEach((file) => {
        formData.append('resumes', file);
      });

      const response = await fetch('/api/matcher', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process resumes');
      }

      const data = await response.json();
      setMessage(data.message);
      setTopResumes(data.topResumes || []);
    } catch (error) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setResumes(Array.from(e.target.files));
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>Job Description and Resume Matcher</h2>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${isLoading ? 'alert-info' : message.includes('Top') ? 'alert-success' : 'alert-warning'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="job_description">Job Description</label>
              <textarea
                className="form-control"
                id="job_description"
                name="job_description"
                rows="5"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="resumes">Upload Resumes</label>
              <p>Please upload Resumes more than 5.....................</p>
              <input
                type="file"
                className="form-control"
                id="resumes"
                name="resumes"
                multiple
                required
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Upload Resumes'}
            </button>
          </form>

          {topResumes.length > 0 && (
            <div className="alert alert-info mt-4">
              <p>{message}</p>
              <ul>
                {topResumes.map((resume, index) => (
                  <li key={index}>
                    {resume.filename} (Similarity Score: {resume.score})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}