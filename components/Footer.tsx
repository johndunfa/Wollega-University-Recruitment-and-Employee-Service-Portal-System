'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaTelegram, FaLinkedinIn, FaTiktok, FaInstagram, FaYoutube, FaFacebookF } from "react-icons/fa";
import { SiX } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 pt-10 pb-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Main content */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          {/* Left: Logo and social media */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Image src="/images.png" alt="WU Logo" width={32} height={32} />
              <span className="font-semibold text-lg text-text-primary">WU</span>
            </div>
            {/* Social Media Links - React Icons, Grey */}
            <div className="flex flex-row gap-4 mt-2 mb-1">
              <a href="https://t.me/xxxxx" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <FaTelegram />
              </a>
              <a href="https://www.linkedin.com/company/xxxxxx/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <FaLinkedinIn />
              </a>
              <a href="https://www.tiktok.com/xxxxxxx" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <FaTiktok />
              </a>
              <a href="https://www.instagram.com/xxxxxxx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <FaInstagram />
              </a>
              <a href="https://www.youtube.com/xxxxxx" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <FaYoutube />
              </a>
              <a href="https://twitter.com/xxxxx" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <SiX />
              </a>
              <a href="https://www.facebook.com/xxxxxx" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-text-primary hover:text-text-primary focus:text-text-primary transition-colors text-lg" tabIndex={0}>
                <FaFacebookF />
              </a>
            </div>
            {/* Copyright - Hidden on mobile, shown on desktop */}
            <span className="text-xs text-gray-500 hidden md:block">© 2025 All rights reserved.</span>
          </div>
          {/* Right: Navigation links */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex flex-row flex-wrap gap-6 md:gap-8 text-sm font-medium text-text-primary">
              <Link href="#about" className="hover:text-text-primary transition-colors">About us</Link>
              <Link href="/jobs" className="hover:text-text-primary transition-colors">Jobs</Link>
              <Link href="#hr" className="hover:text-text-primary transition-colors">HR Team</Link>
              <Link href="#faqs" className="hover:text-text-primary transition-colors">FAQs</Link>
            </div>
            <div className="flex flex-row flex-wrap gap-6 md:gap-8 text-xs text-text-primary">
              <Link href="#privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
              <Link href="#company" className="hover:text-text-primary transition-colors">Company Policies</Link>
            </div>
          </div>
        </div>
        {/* Copyright - Shown on mobile, hidden on desktop */}
        <div className="flex justify-center md:hidden">
          <span className="text-xs text-gray-500">© 2025 All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer 