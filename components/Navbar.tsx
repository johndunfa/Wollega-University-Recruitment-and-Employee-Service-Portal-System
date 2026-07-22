'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ForgotPasswordModal from './ForgotPasswordModal';
import FeedbackModal from './FeedbackModal';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#about', label: 'About us' },
  { href: '/jobs', label: 'Jobs' },
 // { href: '/hr-team', label: 'HR Team' },
  { href: '/#faqs', label: 'FAQs' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseForgot = () => setIsForgotOpen(false);
  const handleForgotSubmit = () => {
    setIsForgotOpen(false);
    setIsFeedbackOpen(true);
  };
  const handleCloseFeedback = () => setIsFeedbackOpen(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      } else {
        window.location.href = href;
      }
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[99vw] max-w-6xl mx-auto">
      <motion.nav
        className="flex items-center justify-between py-3 px-6 lg:px-10 bg-white/40 backdrop-blur-md border border-white/30 shadow-lg rounded-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo with tooltip */}
        <Link href="/" className="relative group flex items-center gap-2">
          <Image
            src="/images.png"
            alt="MiNT Logo"
            width={38}
            height={38}
            className="rounded-full object-contain"
            priority
          />
          <div className="flex flex-col justify-center leading-none">
            <span className="font-bold text-lg md:text-xl text-text-primary">WU</span>
            <span className="text-[0.7rem] md:text-xs font-medium text-gray-500 italic">Jobs</span>
          </div>

          {/* Tooltip (Amharic name) */}
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-sm bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             WALLAGA UNIVERSITY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.95rem] lg:text-base font-medium text-text-primary hover:text-[#087684] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2 px-2 py-1 rounded-md"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="bg-[#087684] text-white font-semibold px-5 py-2 text-sm md:text-base rounded-full shadow hover:bg-[#065d67] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-text-primary hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
          </div>
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 w-full mt-2 bg-white/40 backdrop-blur-md border border-white/30 shadow-lg rounded-3xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="p-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-base font-medium text-text-primary hover:text-[#087684] transition-colors duration-200 px-3 py-2 rounded-md"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/20">
                <Link
                  href="/login"
                  className="block bg-[#087684] text-white font-semibold px-6 py-2 rounded-full text-center shadow hover:bg-[#065d67] transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={handleCloseForgot}
        onSubmit={handleForgotSubmit}
      />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={handleCloseFeedback} />
    </div>
  );
};

export default Navbar;
