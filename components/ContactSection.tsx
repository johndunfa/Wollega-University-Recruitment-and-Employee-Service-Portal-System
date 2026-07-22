'use client'

import Image from 'next/image'
import GoogleMap from './GoogleMap'

// Updated coordinates for 2QF4+M38, Addis Ababa
const MINISTRY_MAP_EMBED = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=2QF4%2BM38%2C+Addis+Ababa%2C+Ethiopia&center=9.0322,38.7636&zoom=15'

const ContactSection = () => {
  return (
    <section className="relative w-full py-20 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gray-100/60 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Info and Map */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full">Contact Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
              How to <span className="text-[#087684]">get in<br className='hidden md:block'/>touch</span> with us
            </h2>
            <p className="text-text-primary text-lg mb-8">Have a question? We're always here to help.</p>
            <GoogleMap />
          </div>

          {/* Right: Cards */}
          <div className="flex flex-col gap-6 w-full">
            {/* Call Us Card */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 flex flex-col gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </span>
              <h3 className="text-xl font-semibold text-text-primary">Call us</h3>
              <p className="text-text-primary mb-3">Speak to us over the phone.</p>
              <a href="tel:+251-111-265737" className="inline-block bg-white/30 backdrop-blur-md text-[#087684] text-sm font-medium px-5 py-2 rounded-lg border border-[#087684] hover:bg-[#087684]/10 hover:text-[#087684] shadow focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2">↳ Call Us</a>
            </div>
            {/* Visit Us Card */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 flex flex-col gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </span>
              <h3 className="text-xl font-semibold text-text-primary">Visit us</h3>
              <p className="text-text-primary mb-3">Monday to Friday 8am - 5pm</p>
              <a href="https://maps.google.com/?q=2QF4+M38,+Addis+Ababa,+Ethiopia" target="_blank" rel="noopener noreferrer" className="inline-block bg-white/30 backdrop-blur-md text-[#087684] text-sm font-medium px-5 py-2 rounded-lg border border-[#087684] hover:bg-[#087684]/10 hover:text-[#087684] shadow focus:outline-none focus:ring-2 focus:ring-[#087684] focus:ring-offset-2">↳ Get Directions</a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default ContactSection 