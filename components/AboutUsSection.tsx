'use client';
import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from './CountUp';

const stats = [
  { value: 20, suffix: '+', label: 'PhD Program' },
  { value: 95, suffix: '+', label: 'Undergraduate Program' },
  { value: 119, suffix: '+', label: 'Masters Program' },
  { value: 1210, suffix: '%', label: 'Academic Staff' },
  { value: 5618, suffix: '+', label: 'Administration Staff' },
  { value: 18303, suffix: '+', label: 'Student' },
];

const AboutUsSection: FC = () => {
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "WOLLEGA UNIVERSITY",
    "ወለጋ  ዩኒቨርሲቲ"
  ];

  // Cycle text every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="about" 
      className="relative w-full min-h-screen flex items-center justify-center bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center gap-6">
        
        {/* Central Hollow ABOUT US */}
        <h1 
          className="text-[52px] md:text-[100px] font-extrabold leading-none text-transparent bg-clip-text bg-center bg-cover"
          style={{ backgroundImage: "url('/about-us.jpg')" }}
        >
          ABOUT US
        </h1>

        {/* Animated Heading */}
        <div className="h-[60px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={textIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl font-bold text-text-primary"
            >
              {texts[textIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-text-primary max-w-2xl leading-snug">
          Wollega University (WU) is a public higher educational institution established in February 2007 by enrolling 851 students in 17 departments under four Faculties:
           Business and Economics, Education, Natural Sciences and Social Sciences. At the time, the University had 140 academic staff, and about 123 administrative support staff.  
           The Wollega University is located on the verge of Nekemte town, which is 310 km away from Addis Ababa westwards,
           with beautiful scenery of landscape and spectacular view of Mount Komto. It is situated on an area of 150 hectares.
        </p>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mt-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              className="flex flex-col items-center justify-center bg-gray-50 rounded-xl shadow p-4 min-h-[130px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#087684] mb-1">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-text-primary text-xs sm:text-sm md:text-base whitespace-pre-line leading-snug font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
