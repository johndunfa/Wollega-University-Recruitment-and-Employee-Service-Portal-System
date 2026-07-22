'use client';

import React, { useState } from 'react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssnLast4?: string; // For US (mask sensitive data)
  jobTitle: string;
  department: string;
  startDate: string;
  salary: string;
  paymentMethod: 'direct' | 'check';
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  agreeToHandbook: boolean;
  agreeToNDA: boolean;
  signature: string;
  dateSigned: string;
}

const HireCandidateForm = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ssnLast4: '',
    jobTitle: '',
    department: '',
    startDate: '',
    salary: '',
    paymentMethod: 'direct',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    agreeToHandbook: false,
    agreeToNDA: false,
    signature: '',
    dateSigned: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.salary) newErrors.salary = 'Salary is required';
    if (formData.paymentMethod === 'direct') {
      if (!formData.bankName) newErrors.bankName = 'Bank name is required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
      if (!formData.routingNumber) newErrors.routingNumber = 'Routing number is required';
    }
    if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    if (!formData.emergencyContactRelationship)
      newErrors.emergencyContactRelationship = 'Relationship is required';
    if (!formData.agreeToHandbook) newErrors.agreeToHandbook = 'You must agree to the Employee Handbook';
    if (!formData.agreeToNDA) newErrors.agreeToNDA = 'You must agree to the NDA';
    if (!formData.signature) newErrors.signature = 'Digital signature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch('/api/hire-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Optionally: redirect or reset form
      } else {
        const  { error } = await response.json();
        console.error('Submission error:', error);
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error('Network error:', err);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">New Hire Onboarding Form</h1>
      <p className="text-gray-600 mb-6">Please complete all sections to finalize your employment setup.</p>

      {submitStatus === 'success' && (
        <div className="mb-6 p-4 text-green-700 bg-green-100 rounded-lg">
          ✅ Form submitted successfully! Welcome aboard.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg">
          ❌ Submission failed. Please try again or contact HR.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Information */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SSN (Last 4 Digits) *</label>
              <input
                type="password"
                name="ssnLast4"
                value={formData.ssnLast4}
                onChange={handleChange}
                placeholder="••••"
                maxLength={4}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.ssnLast4 && <p className="text-red-500 text-sm">{errors.ssnLast4}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              >
                <option value="">-- Select State --</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                {/* Add more states as needed */}
              </select>
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
            </div>
          </div>
        </section>

        {/* Section 2: Employment Details */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Annual Salary ($)*</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              />
              {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
            </div>
          </div>
        </section>

        {/* Section 3: Payment Method */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Payment Method</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="direct"
                checked={formData.paymentMethod === 'direct'}
                onChange={handleChange}
                className="mr-2"
              />
              Direct Deposit
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="check"
                checked={formData.paymentMethod === 'check'}
                onChange={handleChange}
                className="mr-2"
              />
              Paper Check
            </label>

            {formData.paymentMethod === 'direct' && (
              <div className="ml-6 mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {errors.bankName && <p className="text-red-500 text-xs">{errors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {errors.accountNumber && <p className="text-red-500 text-xs">{errors.accountNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Routing Number *</label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {errors.routingNumber && <p className="text-red-500 text-xs">{errors.routingNumber}</p>}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Emergency Contact */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
              />
              {errors.emergencyContactName && <p className="text-red-500 text-sm">{errors.emergencyContactName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
              />
              {errors.emergencyContactPhone && <p className="text-red-500 text-sm">{errors.emergencyContactPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship *</label>
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
              />
              {errors.emergencyContactRelationship && (
                <p className="text-red-500 text-sm">{errors.emergencyContactRelationship}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 5: Agreements */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Agreements</h2>
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToHandbook"
                checked={formData.agreeToHandbook}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <span>
                I have read and agree to the{' '}
                <a href="/policies/handbook.pdf" target="_blank" className="text-blue-600 underline">
                  Employee Handbook
                </a>{' '}
                and company policies. *
              </span>
            </label>
            {errors.agreeToHandbook && <p className="text-red-500 text-sm">{errors.agreeToHandbook}</p>}

            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToNDA"
                checked={formData.agreeToNDA}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <span>
                I agree to the{' '}
                <a href="/policies/nda.pdf" target="_blank" className="text-blue-600 underline">
                  Non-Disclosure Agreement (NDA)
                </a>. *
              </span>
            </label>
            {errors.agreeToNDA && <p className="text-red-500 text-sm">{errors.agreeToNDA}</p>}
          </div>
        </section>

        {/* Section 6: Signature */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Digital Signature</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type your full name to sign *
            </label>
            <input
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {errors.signature && <p className="text-red-500 text-sm">{errors.signature}</p>}

            <p className="text-sm text-gray-600">
              Signed on: <strong>{formData.dateSigned}</strong>
            </p>
          </div>
        </section>

        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Submit Onboarding Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default HireCandidateForm;