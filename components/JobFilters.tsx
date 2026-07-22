'use client'

import { useState, useEffect } from 'react';

type Job = {
  _id: string;
  title: string;
  type: string;
  category: string;
  experienceLevel: string;
  // Add other job fields as needed
};

type FilterOptions = {
  jobType: string[];
  jobFunction: string[];
  experienceLevel: string[];
};

const JobFilters = ({ onFilterChange }: { onFilterChange: (filters: FilterOptions) => void }) => {
  const [expanded, setExpanded] = useState<string[]>(['Job Type']);
  const [filters, setFilters] = useState<FilterOptions>({
    jobType: [],
    jobFunction: [],
    experienceLevel: []
  });
  const [counts, setCounts] = useState({
    jobType: {},
    jobFunction: {},
    experienceLevel: {}
  });
  const [loading, setLoading] = useState(true);

  // Fetch filter counts from API
  useEffect(() => {
    const fetchFilterCounts = async () => {
      try {
        const res = await fetch('/api/jobs/filter-counts');
        const data = await res.json();
        setCounts(data);
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilterCounts();
  }, []);

  // Generate options from database counts
  const jobTypeOptions = Object.entries(counts.jobType).map(([label, count]) => ({
    label,
    count: count as number
  }));

  const jobFunctionOptions = Object.entries(counts.jobFunction).map(([label, count]) => ({
    label,
    count: count as number
  }));

  const experienceOptions = Object.entries(counts.experienceLevel).map(([label, count]) => ({
    label,
    count: count as number
  }));

  const handleToggle = (section: string) => {
    setExpanded(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleFilterChange = (category: keyof FilterOptions, value: string, checked: boolean) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[category] = [...newFilters[category], value];
    } else {
      newFilters[category] = newFilters[category].filter(v => v !== value);
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    setFilters({
      jobType: [],
      jobFunction: [],
      experienceLevel: []
    });
    onFilterChange({
      jobType: [],
      jobFunction: [],
      experienceLevel: []
    });
  };

  const handleExpandAll = () => setExpanded(['Job Type', 'Job Functions', 'Experience Level']);
  const handleCollapseAll = () => setExpanded([]);

  if (loading) {
    return (
      <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded w-full mb-1"></div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 md:mb-0 md:mr-8 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-semibold text-text-primary">Filter</span>
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-blue-600 focus:outline-none"
          onClick={handleClearAll}
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      </div>

      {/* Job Type Filter */}
      <div className="mb-6">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 mb-2 focus:outline-none"
          onClick={() => handleToggle('Job Type')}
          aria-expanded={expanded.includes('Job Type')}
        >
          Job Type
          <span>{expanded.includes('Job Type') ? '-' : '+'}</span>
        </button>
        {expanded.includes('Job Type') && (
          <div className="flex flex-col gap-2">
            {jobTypeOptions.map(opt => (
              <label key={opt.label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-purple-600"
                  checked={filters.jobType.includes(opt.label)}
                  onChange={(e) => handleFilterChange('jobType', opt.label, e.target.checked)}
                />
                <span>{opt.label}</span>
                <span className="ml-auto text-xs text-gray-400">({opt.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Job Functions Filter */}
      <div className="mb-6">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 mb-2 focus:outline-none"
          onClick={() => handleToggle('Job Functions')}
          aria-expanded={expanded.includes('Job Functions')}
        >
          Job Functions
          <span>{expanded.includes('Job Functions') ? '-' : '+'}</span>
        </button>
        {expanded.includes('Job Functions') && (
          <div className="flex flex-col gap-2">
            {jobFunctionOptions.map(opt => (
              <label key={opt.label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-purple-600"
                  checked={filters.jobFunction.includes(opt.label)}
                  onChange={(e) => handleFilterChange('jobFunction', opt.label, e.target.checked)}
                />
                <span>{opt.label}</span>
                <span className="ml-auto text-xs text-gray-400">({opt.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Experience Level Filter */}
      <div className="mb-6">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 mb-2 focus:outline-none"
          onClick={() => handleToggle('Experience Level')}
          aria-expanded={expanded.includes('Experience Level')}
        >
          Experience Level
          <span>{expanded.includes('Experience Level') ? '-' : '+'}</span>
        </button>
        {expanded.includes('Experience Level') && (
          <div className="flex flex-col gap-2">
            {experienceOptions.map(opt => (
              <label key={opt.label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-purple-600"
                  checked={filters.experienceLevel.includes(opt.label)}
                  onChange={(e) => handleFilterChange('experienceLevel', opt.label, e.target.checked)}
                />
                <span>{opt.label}</span>
                <span className="ml-auto text-xs text-gray-400">({opt.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="text-xs text-purple-700 font-medium hover:underline focus:outline-none"
          onClick={handleExpandAll}
          aria-label="Expand all filter sections"
        >
          Expand all
        </button>
        {expanded.length === 3 && (
          <button
            type="button"
            className="text-xs text-gray-600 font-medium hover:underline focus:outline-none"
            onClick={handleCollapseAll}
            aria-label="Collapse all filter sections"
          >
            Show Less
          </button>
        )}
      </div>
    </aside>
  );
};

export default JobFilters;