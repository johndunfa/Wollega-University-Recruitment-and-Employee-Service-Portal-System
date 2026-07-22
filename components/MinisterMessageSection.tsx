'use client';
import { FC } from 'react';
import { motion } from 'framer-motion';

const MinisterMessageSection: FC = () => {
  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-16 flex flex-col md:flex-row items-center md:items-stretch gap-10">
        {/* Left: Minister photo */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.img
            src="/presedant1.jpg"
            alt="Dr. Belete Molla - Minister of Innovation and Technology of Ethiopia"
            className="rounded-2xl max-w-full max-h-[80vh] object-contain shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        {/* Right: Message */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center md:text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-text-primary text-xs rounded-full font-medium">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Message from our President
            </span>
          </div>
          <blockquote className="text-xl md:text-2xl text-text-primary font-normal mb-6 leading-snug">
            "this university is your home of learning, growth, and transformation. You are at the heart of everything we do. We understand the challenges that come with higher education, and we want you to know that you are not alone in this journey. Our university is fully committed to supporting you in achieving your academic goals and career aspirations. Your success is our success."
          </blockquote>
          <div className="text-text-primary font-semibold text-lg mb-1">Tesfaye Lemma (Associate Professor)</div>
          <div className="text-gray-500 text-sm">Wollega University</div>
        </div>
      </div>
    </section>
  );
};

export default MinisterMessageSection; 