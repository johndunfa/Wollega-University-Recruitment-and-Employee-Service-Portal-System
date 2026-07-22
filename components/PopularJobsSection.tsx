'use client';
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  organization: string;
  department: string;
  location: string;
  type: string;
  description?: string;
  createdAt: Date;
  experienceLevel?: string;
  link?: string;
  deadline?: string;
  category?: string;
}

const typeColors: Record<string, string> = {
  FullTime: 'bg-green-100 text-green-700 border-green-200',
  PartTime: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Internship: 'bg-blue-100 text-blue-700 border-blue-200',
};

const PopularJobsSection: FC = () => {
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentJob = popularJobs[current];

   const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  useEffect(() => {
    const fetchPopularJobs = async () => {
      try {
        const res = await fetch('/api/jobs/popular');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setPopularJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchPopularJobs();
  }, []);

  useEffect(() => {
    if (popularJobs.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % popularJobs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [popularJobs.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + popularJobs.length) % popularJobs.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % popularJobs.length);
  };

  const getPostedAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleApplyNow = () => {
    if (!currentJob || isDeadlinePassed(currentJob.deadline)) return;
    window.location.href = `/apply/${currentJob._id}`;
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCloseModal();
  };

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (error || !currentJob) return <div className="py-20 text-center text-red-600">{error || 'No jobs available'}</div>;

  const deadlinePassed = isDeadlinePassed(currentJob.deadline);

  return (
    <section className="relative w-full py-20 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gray-100/60 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Jobs</h2>
          <p className="text-gray-600 text-lg">Explore some of the most sought-after opportunities.</p>
        </div>

        <div className="relative flex items-center justify-center">
          <button onClick={handlePrev} className="absolute left-2 bg-white p-2 rounded-full shadow" aria-label="Previous">
            <ChevronLeft />
          </button>

          <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentJob._id}
          initial={{ opacity: 0, x: 80 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 * direction }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 60 }}
          className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">{currentJob.title}</h3>
            <span className="text-xs text-gray-500">{getPostedAgo(currentJob.createdAt)}</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{currentJob.department} • {currentJob.location}</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              {currentJob.type}
            </span>
            {currentJob.deadline && (
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                deadlinePassed 
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                Deadline: {formatDeadline(currentJob.deadline)}
              </span>
            )}
          </div>
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{currentJob.description}</p>
          <div className="flex gap-3">
            <Link 
              href={deadlinePassed ? '#' : `/apply/${currentJob._id}`}
              className={`flex-1 text-center px-4 py-2 rounded-lg ${
                deadlinePassed 
                  ? 'bg-red-100 text-red-700 cursor-not-allowed' 
                  : 'bg-[#087684] text-white hover:bg-[#087684]/90'
              }`}
              onClick={e => deadlinePassed && e.preventDefault()}
            >
              {deadlinePassed ? 'Closed' : 'Apply Now'}
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 text-center border border-gray-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              More Details
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
          <button onClick={handleNext} className="absolute right-2 bg-white p-2 rounded-full shadow" aria-label="Next">
            <ChevronRight />
          </button>
        </div>

        <div className="flex justify-center mt-6 gap-2">
          {popularJobs.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full border transition ${current === i ? 'bg-[#087684]' : 'bg-gray-300'}`}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            />
          ))}
        </div>
      </div>

      {/* Modal Section */}
      <AnimatePresence>
        {isModalOpen && currentJob && (
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
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-bold">{currentJob.title}</h2>
                  <button onClick={handleCloseModal} aria-label="Close" className="text-gray-400 hover:text-gray-600 p-1">
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-gray-100 text-gray-700 border-gray-200">{currentJob.category || 'General'}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${typeColors[currentJob.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {currentJob.type}
                  </span>
                  {deadlinePassed && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-red-100 text-red-700 border-red-200">
                      Closed
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>{currentJob.location} • {getPostedAgo(currentJob.createdAt)}</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <p className="mb-4">{currentJob.description}</p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Responsibilities</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Develop and maintain high-quality applications</li>
                    <li>Collaborate with cross-functional teams</li>
                    <li>Participate in code reviews</li>
                    <li>Contribute to improvements</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Experience level: {currentJob.experienceLevel || 'Not specified'}</li>
                    <li>Problem-solving skills</li>
                    <li>Teamwork and communication</li>
                  </ul>
                </div>

                {currentJob.link && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">More Info</h4>
                    <a href={currentJob.link} className="text-blue-600 underline break-words" target="_blank" rel="noopener noreferrer">
                      {currentJob.link}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <span className={`text-sm ${deadlinePassed ? 'text-red-600' : 'text-gray-600'}`}>
                    <strong>Deadline:</strong> {currentJob.deadline || 'Not specified'}
                    {deadlinePassed && ' (Closed)'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleCloseModal} className="px-4 py-2 border rounded-lg text-gray-600 bg-white hover:bg-gray-50">Close</button>
                    <button
                      onClick={handleApplyNow}
                      disabled={deadlinePassed}
                      className={`px-6 py-2 rounded-lg ${
                        deadlinePassed
                          ? 'bg-red-100 text-red-700 cursor-not-allowed'
                          : 'bg-[#087684] text-white hover:bg-[#087684]/90'
                      }`}
                    >
                      {deadlinePassed ? 'Applications Closed' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PopularJobsSection;