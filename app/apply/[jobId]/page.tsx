'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';

export default function ApplyPage() {
  const { jobId } = useParams() as { jobId: string };
  const router = useRouter();

  const [job, setJob] = useState<{ title: string } | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [portfolio, setPortfolio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const jobTitle = job ? job.title : 'Job';

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job');
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        setJob(null);
      } finally {
        setLoadingJob(false);
      }
    };

    if (jobId) fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!fullName || !email || !phone || !coverLetter || !cv) {
    setError('Please fill in all required fields and attach your CV.');
    return;
  }

  const formData = new FormData();
  formData.append('fullName', fullName);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('coverLetter', coverLetter);
  formData.append('portfolio', portfolio);
  formData.append('cv', cv);
  formData.append('jobId', jobId);

  // Add this line to send job title along
  formData.append('jobTitle', job?.title || '');

  try {
    const res = await fetch('/api/applications', {  // your POST route
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  } catch (error) {
    console.error(error);
    setError('An error occurred while submitting the application.');
  }
};


  if (loadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading job info...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center w-full pt-20">
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e0f2f1] mt-8 mb-16 relative">
          {/* Back to site button */}
          <Link
            href="/jobs"
            className="absolute top-2 left-2 md:top-4 md:left-4 z-10 text-[#087684] hover:text-[#065a66] text-sm font-medium flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#e0f2f1] transition-all duration-200 hover:bg-white hover:shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {/* Left Column - Decorative and branding */}
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#f8f9fb] via-[#e0f7fa] to-[#b2ebf2] w-1/3 py-12 px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-[#087684] rounded-full"></div>
              <div className="absolute top-32 right-8 w-16 h-16 bg-[#EF9E33] rounded-full"></div>
              <div className="absolute bottom-20 left-16 w-12 h-12 bg-[#087684] rounded-full"></div>
              <div className="absolute bottom-32 right-16 w-8 h-8 bg-[#EF9E33] rounded-full"></div>
            </div>

            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img src="/mint-logo.png" alt="Mint Logo" className="w-16 h-16 rounded-full shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#EF9E33] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#087684] block">WU Jobs</span>
                  <span className="text-sm text-gray-600 mt-1 block">Career Opportunities</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="w-8 h-8 bg-[#087684] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Quick Application</p>
                    <p className="text-xs text-gray-600">Simple & Fast Process</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="w-8 h-8 bg-[#EF9E33] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Secure & Private</p>
                    <p className="text-xs text-gray-600">Your Data is Protected</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="w-8 h-8 bg-[#087684] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Fast Response</p>
                    <p className="text-xs text-gray-600">Quick Feedback</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-0 w-full flex justify-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${40 + i}.jpg`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="w-full md:w-2/3 flex flex-col justify-center items-center py-12 px-6 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#087684] mb-2 text-center">WU Application</h1>
            <p className="text-gray-500 text-base md:text-lg mb-8 text-center">
              Apply for <span className="font-semibold text-[#087684]">{jobTitle}</span>. Fill out the form and our team will review your
              application promptly.
            </p>
            {success ? (
              <div className="text-green-600 text-center font-semibold py-8">
                Your application has been submitted!
                <br />
                Redirecting to home...
              </div>
            ) : (
              <form className="w-full max-w-xl space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#087684] focus:outline-none bg-gray-50 text-base"
                      placeholder="Enter your full name"
                      aria-label="Full Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#087684] focus:outline-none bg-gray-50 text-base"
                      placeholder="Enter your email"
                      aria-label="Email"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#087684] focus:outline-none bg-gray-50 text-base"
                      placeholder="Enter your phone number"
                      aria-label="Phone Number"
                    />
                  </div>
                  <div>
                    <label htmlFor="portfolio" className="block text-xs font-medium text-gray-700 mb-1">
                      LinkedIn / Portfolio URL (optional)
                    </label>
                    <input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#087684] focus:outline-none bg-gray-50 text-base"
                      placeholder="https://linkedin.com/in/yourprofile"
                      aria-label="Portfolio URL"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="coverLetter" className="block text-xs font-medium text-gray-700 mb-1">
                    Cover Letter / Motivation<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#087684] focus:outline-none bg-gray-50 text-base min-h-[100px]"
                    placeholder="Tell us why you're a great fit for this job"
                    aria-label="Cover Letter"
                  />
                </div>
                <div>
                  <label htmlFor="cv" className="block text-xs font-medium text-gray-700 mb-1">
                    Attach CV<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cv"
                    name="cv"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCv(e.target.files?.[0] || null)}
                    className="w-full text-base text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-[#e0f7fa] file:text-[#087684] hover:file:bg-[#b2ebf2]"
                    aria-label="Attach CV"
                  />
                </div>
                {error && <div className="text-red-500 text-xs">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#087684] hover:bg-[#065a5e] text-white text-lg font-bold shadow focus:ring-2 focus:ring-[#087684] focus:outline-none mt-2 transition"
                  aria-label="Submit Application"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
