'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Job = {
  _id: string;
  title: string;
  organization: string;
  description?: string;
  department?: string;
  location?: string;
};

export default function EditJobPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch job by ID
  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch job. Status: ${res.status}`);
        }

        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job data.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // ✅ Edit handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });

      if (!res.ok) throw new Error('Update failed');
      router.push('/jobs');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');
      router.push('/jobs');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-[#087684] mb-4">MInT Job Editor</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2"
          value={job?.title || ''}
          onChange={(e) => setJob((prev) => ({ ...prev!, title: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Organization"
          className="w-full border p-2"
          value={job?.organization || ''}
          onChange={(e) => setJob((prev) => ({ ...prev!, organization: e.target.value }))}
        />
        <textarea
          placeholder="Description"
          className="w-full border p-2"
          value={job?.description || ''}
          onChange={(e) => setJob((prev) => ({ ...prev!, description: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Department"
          className="w-full border p-2"
          value={job?.department || ''}
          onChange={(e) => setJob((prev) => ({ ...prev!, department: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full border p-2"
          value={job?.location || ''}
          onChange={(e) => setJob((prev) => ({ ...prev!, location: e.target.value }))}
        />
        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
