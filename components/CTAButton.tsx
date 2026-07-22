'use client';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CTAButton: FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/jobs');
  };

  return (
    <motion.button
      className="w-full md:w-auto px-8 py-3 rounded-full bg-white/30 backdrop-blur-md text-[#087684] text-lg font-semibold shadow-lg border border-[#087684] focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2 transition-transform duration-200 hover:bg-[#087684]/10 hover:text-[#087684] hover:scale-105 mt-2"
      onClick={handleClick}
      tabIndex={0}
      aria-label="Search for Jobs"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      Search for Jobs
    </motion.button>
  );
};

export default CTAButton; 