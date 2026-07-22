'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const FloatingJobPrompt = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Always call hooks before any return
  useEffect(() => {
    setIsMounted(true)
    
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Only return after all hooks
  if (pathname === '/jobs' || !isMounted) {
    return null
  }

  const handleClick = () => {
    router.push('/jobs')
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="Look for Jobs"
            className="
              bg-white/30 backdrop-blur-md text-[#087684] font-medium px-4 py-3 
              rounded-lg shadow-lg border border-[#087684]
              hover:bg-[#087684]/10 hover:text-[#087684] hover:shadow-xl
              transform hover:scale-105 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2
            "
          >
            <span className="flex items-center gap-2">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              Look for Jobs
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FloatingJobPrompt 