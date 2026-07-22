'use client';

import { useState, useEffect, FC, ChangeEvent, KeyboardEvent } from 'react';

type Job = {
  id: string | number;
  title: string;
  organization?: string;
  location?: string;
  type?: string;
};

const SearchBar: FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch jobs matching the query
  const fetchJobs = async (searchTerm: string) => {
    if (searchTerm.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError('Failed to load jobs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search on typing
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchJobs(query);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Optional: Search immediately on Enter key
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchJobs(query);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Search by job title or keyword..."
        className="rounded-full border border-gray-300 shadow-md px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-[#087684] w-full transition-colors duration-200"
        value={query}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        aria-label="Search by job title or keyword"
        tabIndex={0}
      />
      <button
        onClick={() => fetchJobs(query)}
        className="mt-2 px-4 py-2 bg-[#087684] text-white rounded-full font-semibold hover:bg-[#065a55] transition-colors"
        aria-label="Search jobs"
        type="button"
      >
        Search
      </button>

      <div className="mt-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && results.length === 0 && query.trim().length > 0 && (
          <p>No jobs found for "{query}"</p>
        )}
        {!loading && results.length > 0 && (
          <ul className="mt-2 space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
            {results.map((job) => (
              <li key={job.id} className="p-2 border-b last:border-b-0 hover:bg-gray-50 rounded cursor-pointer">
                <strong>{job.title}</strong> {job.organization && `- ${job.organization}`}
                <div className="text-sm text-gray-600">{job.location} - {job.type}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
