'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';

const SignupPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    employee_id: '',
    password: '',
    name: '',
    department: '',
    role: '',
    email: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Signup failed');
    } else {
      router.push('/login'); // Redirect to login
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e6f6f8] via-[#f0f9fa] to-[#e6f6f8]">
      
      {/* Page Title */}
      <div className="text-center pt-8 mb-8">
        <h1 className="text-3xl font-bold text-[#087684] mb-2">MInT Portal</h1>
        <p className="text-gray-600">Create your account</p>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-[#e0f2f1] space-y-5">
          <h2 className="text-2xl font-bold text-center text-[#087684]">Create Account</h2>

          {['employee_id', 'name', 'department', 'role', 'email', 'password'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize" htmlFor={field}>
                {field.replace('_', ' ')}<span className="text-red-500">*</span>
              </label>
              {field === 'role' ? (
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#087684]"
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="hr-manager">HR Manager</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              ) : (
                <input
                  id={field}
                  name={field}
                  type={field === 'password' ? 'password' : 'text'}
                  required
                  value={form[field as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#087684]"
                  placeholder={`Enter your ${field.replace('_', ' ')}`}
                />
              )}
            </div>
          ))}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#087684] hover:bg-[#065a5e] text-white text-base font-bold shadow"
          >
            Create Account
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default SignupPage;
