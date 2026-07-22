'use client';

import Navbar from '../../components/Navbar';
import JobFilters from '../../components/JobFilters';
import JobCard from '../../components/JobCard';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';

function getPostedAgo(dateString: string): string {
  const createdAt = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

type Job = {
  _id: string;
  title?: string;
  organization?: string;
  description?: string;
  department?: string;
  category?: string;
  location?: string;
  type?: string;
  experienceLevel?: string;
  deadline?: string;
  createdAt: string;
};

type FilterState = {
  jobType: string[];
  jobFunction: string[];
  experienceLevel: string[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    jobType: [],
    jobFunction: [],
    experienceLevel: [],
  });
  const [sort, setSort] = useState('Popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleJobs, setVisibleJobs] = useState(6);
  const [viewMoreCount, setViewMoreCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setVisibleJobs(6);
    setViewMoreCount(0);
  };

  const filteredJobs = jobs
  .filter(job => {
    const titleMatch = (job.title ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const jobTypeMatch = filters.jobType.length === 0 || filters.jobType.includes(job.type ?? '');
    const functionMatch = filters.jobFunction.length === 0 || filters.jobFunction.includes(job.category ?? '');
    const experienceMatch = filters.experienceLevel.length === 0 || filters.experienceLevel.includes(job.experienceLevel ?? '');

    return titleMatch && jobTypeMatch && functionMatch && experienceMatch;
  })
  .map(job => ({
    ...job,
    organization: job.organization?.replace(/Ministry of Innovation|MInT/gi, 'Innovation Hub') ?? 'Unknown Org'
  }));


  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sort === 'Newest' ? dateB - dateA : dateA - dateB;
  });

  const handleViewMore = () => {
    const newCount = viewMoreCount + 1;
    setViewMoreCount(newCount);
    if (newCount === 3) setVisibleJobs(sortedJobs.length);
    else setVisibleJobs(prev => Math.min(prev + 6, sortedJobs.length));
  };

  const handleShowLess = () => {
    setViewMoreCount(0);
    setVisibleJobs(6);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const displayedJobs = sortedJobs.slice(0, visibleJobs);
  const hasMoreJobs = visibleJobs < sortedJobs.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#087684]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-white overflow-x-hidden pt-28">
      <Navbar />

      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#087684] mb-2">WU Jobs Portal</h1>
          <p className="text-lg text-gray-500 mb-8">Search for your desired job matching your skills</p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-0 bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-2 mb-8">
            <div className="flex items-center flex-1 px-3">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Enter Job title"
                className="w-full bg-transparent outline-none text-base text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-[#087684] hover:bg-[#087684]/90 text-white font-semibold px-8 py-3 rounded-xl ml-0 md:ml-4 mt-2 md:mt-0">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <JobFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">All Jobs</span>
              <span className="text-sm text-gray-400">({filteredJobs.length})</span>
            </div>
            <div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Popular">Popular</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            {displayedJobs.map((job) => (
              <JobCard
  key={job._id}
  id={job._id}
  title={job.title ?? 'Untitled Job'}
  department={job.organization ?? 'Unknown'}
  description={job.description}
  category={job.category ?? 'General'}
  type={job.type ?? 'Full-time'}
  location={job.location ?? 'Remote'}
  experienceLevel={job.experienceLevel ?? 'N/A'}
  deadline={job.deadline ?? 'N/A'}
  postedAgo={getPostedAgo(job.createdAt)}
/>

            ))}
          </div>

          <div className="flex justify-center mt-10 gap-4">
            {hasMoreJobs && viewMoreCount < 3 && (
              <button onClick={handleViewMore} className="text-[#087684] font-medium hover:underline text-lg">
                {viewMoreCount === 2 ? 'View All' : 'View More'}
              </button>
            )}
            {(viewMoreCount >= 3 || visibleJobs > 6) && (
              <button onClick={handleShowLess} className="text-gray-600 font-medium hover:underline text-lg">
                Show Less
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
