'use client';
import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AVATARS = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/women/46.jpg',
];

const phrases = [
  "Job Listing & Recruiting Platform",
  "የስራ ዝርዝር እና የሥራ እድሎች ፕላትፎርም",
];

const longestPhrase = phrases.reduce((longest, current) =>
  current.length > longest.length ? current : longest
, "");

const HeroSection: FC = () => {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx];
    let timeout: NodeJS.Timeout;
    if (!deleting && charIdx < currentPhrase.length) {
      timeout = setTimeout(() => setCharIdx(charIdx + 1), 80);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(charIdx - 1), 40);
    } else if (!deleting && charIdx === currentPhrase.length) {
      timeout = setTimeout(() => setDeleting(true), 1200);
    } else if (deleting && charIdx === 0) {
      timeout = setTimeout(() => {
        setDeleting(false);
        setPhraseIdx((phraseIdx + 1) % phrases.length);
      }, 400);
    }
    setDisplayed(currentPhrase.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx]);

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center bg-white relative overflow-hidden px-8 lg:px-16 pt-32 pb-8">
      {/* Background pattern */}
      <div className="absolute inset-y-0 left-0 w-1/3 max-w-md z-[-1] pointer-events-none select-none" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" className="h-full w-full">
          <defs>
            <pattern id="hexPattern" width="32" height="27.71" patternUnits="userSpaceOnUse">
              <polygon points="16,0 32,8 32,24 16,32 0,24 0,8" fill="none" stroke="#000" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width="400" height="600" fill="url(#hexPattern)" />
        </svg>
      </div>

      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center gap-16 z-10">
        {/* Left side */}
        <div className="flex-1 w-full max-w-lg lg:max-w-xl">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-[1.05]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="block">WU Jobs<span className="mx-2">:</span></span>

            {/* Fixed subtitle */}
            <span
              className="block mt-3 text-[#EF9E33] font-semibold text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight"
              style={{ minHeight: "2.5em" }} // reserves space for switching phrases
              aria-live="polite"
            >
              {displayed}
              <span className="ml-1 opacity-80">|</span>
            </span>
          </motion.h1>

          <p className="text-base md:text-lg text-text-primary mb-6 max-w-lg">
            Discover and apply for jobs at the Wollega University (WU). Search by title or keyword, filter listings, and submit your resume. Track your applications with active and timely notifications after submitting.
          </p>

          {/* Search Box */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search by job title or keyword..."
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-l-lg focus:outline-none focus:border-[#087684] focus:ring-2 focus:ring-[#087684]/20 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 pr-32"
              />
              <Link
                href="/jobs"
                className="absolute right-1 bg-[#087684] text-white text-sm font-medium px-4 py-2.5 rounded-r-lg hover:bg-[#087684]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Search
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right side */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <motion.div
            className="relative w-full max-w-lg lg:max-w-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <img
              src="/image2.jpg" // <-- local image in public folder
              alt="Diverse team collaboration"
              className="rounded-2xl w-full object-cover aspect-[4/3] shadow-xl"
            />
          </motion.div>

          <motion.div
            className="flex items-center gap-2 mt-6 w-full max-w-lg lg:max-w-xl justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          >
            {AVATARS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Employee avatar"
                className={`w-10 h-10 rounded-full border-2 border-white shadow-md ${i === 0 ? '' : '-ml-6'}`}
              />
            ))}
            <span className="ml-3 text-text-primary text-sm font-medium">+20 Happy employees</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
