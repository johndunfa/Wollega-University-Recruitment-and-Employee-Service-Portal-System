"use client";
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const hrMembers = [
  {
    name: 'Sara Mekonnen',
    title: 'HR Manager',
    email: 'sara.mekonnen@mint.gov.et',
    phone: '+251 911 123 456',
    department: 'Human Resources',
    experience: '8+ years',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&h=300&q=80',
    bio: 'Leading our HR initiatives with a focus on employee development and organizational culture.',
    specialties: ['Strategic HR', 'Employee Relations', 'Talent Management']
  },
  {
    name: 'Abel Tadesse',
    title: 'Recruitment Lead',
    email: 'abel.tadesse@mint.gov.et',
    phone: '+251 922 234 567',
    department: 'Talent Acquisition',
    experience: '6+ years',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    bio: 'Specializing in finding and attracting top talent for innovative technology roles.',
    specialties: ['Technical Recruitment', 'Campus Hiring', 'Employer Branding']
  },
  {
    name: 'Lily Tesfaye',
    title: 'Employee Relations',
    email: 'lily.tesfaye@mint.gov.et',
    phone: '+251 933 345 678',
    department: 'Employee Relations',
    experience: '5+ years',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80',
    bio: 'Ensuring positive workplace relationships and resolving employee concerns effectively.',
    specialties: ['Conflict Resolution', 'Employee Engagement', 'Policy Development']
  },
  {
    name: 'Samuel Kebede',
    title: 'HR Specialist',
    email: 'samuel.kebede@mint.gov.et',
    phone: '+251 944 456 789',
    department: 'HR Operations',
    experience: '4+ years',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80',
    bio: 'Managing HR processes and ensuring smooth operations across all departments.',
    specialties: ['HRIS Management', 'Benefits Administration', 'Compliance']
  },
  {
    name: 'Helen Asfaw',
    title: 'HR Coordinator',
    email: 'helen.asfaw@mint.gov.et',
    phone: '+251 955 567 890',
    department: 'HR Support',
    experience: '3+ years',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
    bio: 'Providing comprehensive HR support and coordinating various HR initiatives.',
    specialties: ['Onboarding', 'Training Coordination', 'HR Administration']
  },
];

const testimonials = [
  {
    quote: "The HR team made my application process smooth and welcoming! They were always available to answer my questions.",
    name: "Mekdes Alemu",
    role: "Software Engineer",
    company: "MInT Innovation Hub",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5
  },
  {
    quote: "I felt supported every step of the way. The HR team truly cares about employee well-being and growth.",
    name: "Yonas Getachew",
    role: "Data Analyst",
    company: "MInT Innovation Hub",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5
  },
  {
    quote: "Professional and caring approach throughout the entire process. They create a positive workplace culture.",
    name: "Bethel Tadesse",
    role: "Project Manager",
    company: "MInT Innovation Hub",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5
  },
  {
    quote: "Clear communication and timely updates made all the difference. Excellent support system for career growth.",
    name: "Daniel Kebede",
    role: "UX Designer",
    company: "MInT Innovation Hub",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5
  },
  {
    quote: "The HR team truly understands what candidates and employees need. Transparent policies and fair treatment.",
    name: "Ruth Asfaw",
    role: "Marketing Specialist",
    company: "MInT Innovation Hub",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5
  },
  {
    quote: "Exceptional experience from application to onboarding. They are always available to help with any issue.",
    name: "Michael Tekle",
    role: "Product Manager",
    company: "MInT Innovation Hub",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5
  },
];

const HRTeamSection: FC = () => {
  const [selectedMember, setSelectedMember] = useState<typeof hrMembers[0] | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleMemberClick = (member: typeof hrMembers[0]) => {
    setSelectedMember(selectedMember?.email === member.email ? null : member);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full bg-gradient-to-br from-[#f8f9fb] to-[#e0f7fa] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-gray-900">
              Meet Our HR Team
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
              Our dedicated HR professionals are committed to creating an inclusive, supportive, and innovative workplace. 
              We've facilitated the recruitment of 200+ employees and maintain a 95% employee satisfaction rate.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">200+ Employees Recruited</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">95% Satisfaction Rate</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {hrMembers.map((member, index) => (
            <motion.div
              key={member.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleMemberClick(member)}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium">{member.experience} Experience</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-[#087684] font-semibold mb-2">{member.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{member.department}</p>
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.slice(0, 2).map((specialty, idx) => (
                      <span key={idx} className="text-xs bg-[#e0f7fa] text-[#087684] px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedMember.img}
                    alt={selectedMember.name}
                    className="w-full h-48 object-cover object-center"
                  />
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMember.name}</h3>
                  <p className="text-lg text-[#087684] font-semibold mb-1">{selectedMember.title}</p>
                  <p className="text-sm text-gray-500 mb-4">{selectedMember.department} • {selectedMember.experience}</p>
                  <p className="text-gray-700 mb-4">{selectedMember.bio}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#087684]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#087684]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{selectedMember.phone}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.specialties.map((specialty, idx) => (
                        <span key={idx} className="text-sm bg-[#e0f7fa] text-[#087684] px-3 py-1 rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

                 {/* Testimonials Section */}
         <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
           <div className="text-center mb-8">
             <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
               What Our Team Says
             </h3>
             <p className="text-gray-600">
               Real feedback from our employees about their experience with our HR department
             </p>
           </div>

           {/* Desktop Marquee Testimonials */}
           <div className="hidden md:block">
             <div className="overflow-hidden">
               <div className="flex gap-6 animate-marquee" style={{ animationDuration: '40s' }}>
                 {[...testimonials, ...testimonials].map((testimonial, index) => (
                   <div key={index} className="flex-shrink-0 w-80">
                     <div className="bg-gradient-to-br from-[#f8f9fb] to-[#e0f7fa] rounded-2xl p-6 border border-[#b2ebf2] h-full">
                       <div className="flex items-start gap-4">
                         <img
                           src={testimonial.img}
                           alt={testimonial.name}
                           className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                         />
                         <div className="flex-1">
                           <div className="flex items-center gap-1 mb-2">
                             {[...Array(testimonial.rating)].map((_, i) => (
                               <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                               </svg>
                             ))}
                           </div>
                           <p className="text-gray-700 mb-3 italic text-sm">"{testimonial.quote}"</p>
                           <div>
                             <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                             <p className="text-xs text-gray-500">{testimonial.role} • {testimonial.company}</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           {/* Mobile Testimonials Carousel */}
           <div className="md:hidden">
             <div className="relative">
               <div className="overflow-hidden">
                 <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                   {testimonials.map((testimonial, index) => (
                     <div key={index} className="w-full flex-shrink-0 px-2">
                       <div className="bg-gradient-to-br from-[#f8f9fb] to-[#e0f7fa] rounded-2xl p-6 border border-[#b2ebf2]">
                         <div className="flex items-start gap-4">
                           <img
                             src={testimonial.img}
                             alt={testimonial.name}
                             className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                           />
                           <div className="flex-1">
                             <div className="flex items-center gap-1 mb-2">
                               {[...Array(testimonial.rating)].map((_, i) => (
                                 <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                 </svg>
                               ))}
                             </div>
                             <p className="text-gray-700 mb-3 italic text-sm">"{testimonial.quote}"</p>
                             <div>
                               <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                               <p className="text-xs text-gray-500">{testimonial.role} • {testimonial.company}</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* Navigation Dots */}
               <div className="flex justify-center mt-6 gap-2">
                 {testimonials.map((_, index) => (
                   <button
                     key={index}
                     onClick={() => setActiveTestimonial(index)}
                     className={`w-2 h-2 rounded-full transition-colors ${
                       index === activeTestimonial ? 'bg-[#087684]' : 'bg-gray-300'
                     }`}
                   />
                 ))}
               </div>

               {/* Navigation Arrows */}
               <button
                 onClick={prevTestimonial}
                 className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
               >
                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                 </svg>
               </button>
               <button
                 onClick={nextTestimonial}
                 className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
               >
                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
             </div>
           </div>

                       <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 40s linear infinite;
              }
            `}</style>
         </div>

        {/* Contact Information */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#087684] to-[#065a5e] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
            <p className="text-lg mb-6 opacity-90">
              Have questions? Our HR team is here to help you with any inquiries about careers, applications, or employee matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hr@mint.gov.et"
                className="inline-flex items-center gap-2 bg-white text-[#087684] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
              <a
                href="tel:+251911123456"
                className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HRTeamSection; 