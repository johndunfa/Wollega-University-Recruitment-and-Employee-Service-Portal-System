'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const faqData = [
  {
    id: 1,
    question: 'How can I apply for a job through the portal?',
    answer:
      'To apply for a job, visit the Jobs page, browse available positions, and click on the "Apply Now" button for your desired job. Follow the instructions to complete your application.'
  },
  {
    id: 2,
    question: 'I have submitted my application, How can I track its status?',
    answer:
      'After submitting your application, you can log in to your account and view the status of your application in the dashboard. You will also receive email notifications for important updates.'
  },
  {
    id: 3,
    question: 'I forgot my password. What should I do?',
    answer:
      'Click on the "Forgot Password" link on the login page. Enter your registered email address to receive a password reset link.'
  },
  {
    id: 4,
    question: 'How do I request leave as an employee?',
    answer:
      'Log in to your employee account, navigate to the Leave section, and fill out the leave request form. Your request will be reviewed by your supervisor.'
  },
  {
    id: 5,
    question: 'Who can I contact for help with the portal?',
    answer:
      'For assistance, please contact our support team at +251 576 61 79 81 or email info@wollegauniversity.edu.et/wuregistrar@wollegauniversity.edu.et.'
  },
]

const FAQSection = () => {
  const [openId, setOpenId] = useState<number | null>(null)

  const handleToggle = (id: number) => {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <section id="faqs" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Image with floating call icon */}
          <div className="relative w-full h-[340px] md:h-[420px] rounded-3xl overflow-hidden flex items-center justify-center bg-gray-100">
            <Image
              src="https://images.pexels.com/photos/1181355/pexels-photo-1181355.jpeg?auto=compress&w=600&q=80"
              alt="People raising hands in a meeting"
              fill
              className="object-cover rounded-3xl"
              priority
            />
            <a
              href="tel:+251-111-265737"
              aria-label="Call support"
              className="absolute top-4 right-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-full w-12 h-12 flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
              tabIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
            </a>
          </div>

          {/* Right: FAQ Content */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full">FAQs</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-8 leading-tight">
              Frequently asked <span className="text-[#EF9E33]">questions</span>
            </h2>
            <div className="space-y-4">
              {faqData.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="rounded-xl shadow-md hover:shadow-lg transition-shadow bg-white/30 backdrop-blur-md overflow-hidden"
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="w-full flex items-center text-left px-6 py-5 group focus:ring-0 focus-visible:ring-0 active:ring-0 border-none"
                    aria-expanded={openId === item.id}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className="flex items-center justify-center w-6 h-6 mr-4 rounded-full border border-gray-300 bg-gray-50 group-hover:bg-gray-200 group-focus:bg-gray-200 cursor-pointer transition-colors">
                      <motion.svg
                        animate={{ rotate: openId === item.id ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </motion.svg>
                    </span>
                    <span className="text-base md:text-lg font-medium text-text-primary">
                      {item.question}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        id={`faq-answer-${item.id}`}
                        className="overflow-hidden border-none"
                      >
                        <div className="px-6 pb-5">
                          <p className="text-text-primary leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection 