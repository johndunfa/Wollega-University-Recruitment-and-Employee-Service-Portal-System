'use client';

import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  type?: string;
  location?: string;
  description?: string;
  postedAgo?: string;
  experienceLevel?: string;
  deadline?: string;
  category?: string;
  link?: string;
}

const typeColors: Record<string, string> = {
  'Full-time': 'bg-green-100 text-green-700 border-green-200',
  'Internship': 'bg-blue-100 text-blue-700 border-blue-200',
  'Part-time': 'bg-purple-100 text-purple-700 border-purple-200',
};

const isDeadlinePassed = (deadline?: string): boolean => {
  if (!deadline || deadline === 'No deadline') return false;
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  } catch {
    return false;
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString || dateString === 'No deadline') return 'No deadline';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const JobCard: FC<JobCardProps> = ({
  id,
  title,
  department,
  type = 'Full-time',
  location = 'Remote',
  description = 'No description provided.',
  postedAgo = 'Posted recently',
  experienceLevel,
  deadline = 'No deadline',
  category = 'General',
  link = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const deadlinePassed = isDeadlinePassed(deadline);

  const handleViewDetails = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleApplyNow = () => {
    if (!deadlinePassed) {
      router.push(`/apply/${id}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') handleCloseModal();
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 w-full group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        tabIndex={0}
        aria-label={`Job: ${title} at ${department}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
          <h2 className="text-xl font-bold text-text-primary" title={title}>{title}</h2>
          <span className="text-xs text-gray-400 md:text-right">{postedAgo}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-2">
          <span className="text-text-primary font-medium flex items-center gap-1">
            {department}
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-text-primary flex items-center gap-1 md:ml-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </span>
        </div>

        <div className="mb-2 text-text-primary text-sm">
          We're seeking a <span className="font-semibold">{title}</span> to {description}
          {link && (
            <>
              <br />
              <span className="font-semibold">Full JD & Application Form: </span>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all hover:text-blue-800"
              >
                {link}
              </a>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-200">{category}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{type}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
          <div className="flex flex-row flex-wrap gap-6 md:gap-8 mb-2 md:mb-0">
            <div className="flex flex-col items-start">
              <span className="text-gray-700 font-semibold text-base">{experienceLevel}</span>
              <span className="text-xs text-gray-400">Experience level</span>
            </div>
            <div className="flex flex-col items-start">
              <span className={`font-semibold text-base ${deadlinePassed ? 'text-red-600' : 'text-gray-700'}`}>
                {formatDate(deadline)}
              </span>
              <span className="text-xs text-gray-400">Deadline</span>
            </div>
          </div>

          <div className="flex flex-row gap-2 md:ml-auto">
            <button
              onClick={handleViewDetails}
              className="bg-white text-[#222] border border-[#222] font-medium text-sm px-3 py-1.5 rounded-full hover:bg-gray-100 hover:border-[#444] hover:text-[#444] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#444] focus:ring-offset-2 w-24 text-center cursor-pointer"
              tabIndex={0}
              aria-label={`View details for ${title}`}
            >
              View Details
            </button>

            <Link
              href={deadlinePassed ? '#' : `/apply/${id}`}
              className={`font-medium text-sm px-3 py-1.5 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-24 text-center flex items-center justify-center ${
                deadlinePassed
                  ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100 focus:ring-red-300 cursor-not-allowed'
                  : 'bg-[#087684] text-white border-[#087684] hover:bg-[#087684]/90 focus:ring-[#087684]'
              }`}
              tabIndex={deadlinePassed ? -1 : 0}
              aria-disabled={deadlinePassed}
              aria-label={
                deadlinePassed 
                  ? 'Application deadline has passed' 
                  : `Apply for ${title}`
              }
              onClick={(e) => {
                if (deadlinePassed) {
                  e.preventDefault();
                }
              }}
            >
              {deadlinePassed ? 'Closed' : 'Apply Now'}
            </Link>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-gray-100 text-gray-700 border-gray-200">{category}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${typeColors[type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{type}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {postedAgo}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      We're seeking a <span className="font-semibold">{title}</span> to join our team at {department}. 
                      This is an exciting opportunity to work in a dynamic environment and contribute to our mission and excellence.
                    </p>
                    <p className="mb-4">
                      {description}
                    </p>
                    {link && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Full Job Description & Application Form:</h4>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all hover:text-blue-800"
                        >
                          {link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Application Deadline: </span>
                    <span className={`font-semibold ${deadlinePassed ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatDate(deadline)}
                      {deadlinePassed && (
                        <span className="text-red-500 ml-2">(Closed)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleApplyNow}
                      disabled={deadlinePassed}
                      className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        deadlinePassed
                          ? 'bg-red-100 text-red-700 border-red-200 cursor-not-allowed'
                          : 'bg-[#087684] text-white hover:bg-[#087684]/90 focus:ring-[#087684]'
                      }`}
                    >
                      {deadlinePassed ? 'Application Closed' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JobCard;