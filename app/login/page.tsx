'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !password) {
      setError('Please enter both Employee ID and Password.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        setError('Invalid server response.');
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // ✅ Store user data
      const userToStore = {
        name: data.name,
        employeeId: data.employeeId || data.employee_id || employeeId,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem('user', JSON.stringify(userToStore));

      // ✅ Redirect based on role
      switch (userToStore.role) {
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "hr":
        case "hr-manager":
          router.push("/dashboard/hr-manager");
          break;
        case "employee":
          router.push("/dashboard/employee");
          break;
        case "manager":
          router.push("/dashboard/manager");
          break;
        case "ict-manager":
        case "it":
        case "ict":
        case "it-manager":
          router.push("/dashboard/ITICTDashboard");
          break;
        case "finance":
        case "finance-manager":
          router.push("/dashboard/FinanceDashboard");
          break;
        default:
          setError("Unknown role");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Try again later.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e6f6f8] via-[#f0f9fa] to-[#e6f6f8]">
      {/* Top nav */}
      <div className="sticky top-0 left-0 z-30 w-full flex justify-start px-6 pt-6 bg-transparent">
        <Link
          href="/"
          className="flex items-center text-[#087684] hover:text-[#065a5e] font-medium text-sm"
          aria-label="Back to Home"
        >
          <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Login form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e0f2f1] mx-4 md:mx-0 mt-12 mb-16">
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8 w-full">
              <div className="w-12 h-12 bg-[#e0f7fa] rounded-full flex items-center justify-center mb-2">
                <svg className="w-7 h-7 text-[#087684]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="8" rx="2" />
                  <path d="M12 15v2" strokeLinecap="round" />
                  <path d="M8 11V7a4 4 0 118 0v4" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Welcome back!</h1>
              <p className="text-xs md:text-sm text-gray-500 text-center">Enter your credentials to continue.</p>
            </div>

            <form className="space-y-5 w-full max-w-sm" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-text-primary mb-1">
                  Employee ID<span className="text-red-500">*</span>
                </label>
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#087684] focus:outline-none"
                  placeholder="Enter your Employee ID"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 pr-10 focus:ring-2 focus:ring-[#087684] focus:outline-none"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#087684]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.94 10.94 0 0112 19C7 19 2.73 15.89 1 12c1.21-2.84 3.62-5.16 6.58-6.32M3 3l18 18" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 9.53A3 3 0 0112 15a3 3 0 002.47-5.47" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-xs text-text-primary">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-[#087684]"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-[#087684] hover:underline text-xs">
                  Forgot password?
                </Link>
              </div>

              {error && <div className="text-red-500 text-xs">{error}</div>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#087684] hover:bg-[#065a5e] text-white text-base font-bold focus:ring-2 focus:ring-[#087684] focus:outline-none mt-2"
              >
                Log In
              </button>
            </form>
          </div>

          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#e0f2f1] relative items-center justify-center">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center opacity-80">
              <div className="w-24 h-24 bg-[#b2ebf2] rounded-full absolute top-10 left-10 mix-blend-multiply"></div>
              <div className="w-32 h-32 bg-[#4dd0e1] rounded-2xl absolute bottom-16 right-16 mix-blend-multiply"></div>
              <div className="w-16 h-16 bg-[#087684] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"></div>
              <div className="w-12 h-12 bg-[#80cbc4] rounded-full absolute bottom-10 left-1/3 mix-blend-multiply"></div>
              <div className="w-20 h-8 bg-white/30 rounded-lg absolute top-24 right-24"></div>
              <div className="w-8 h-20 bg-white/20 rounded-lg absolute bottom-24 left-24"></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
  
};

export default LoginPage;
