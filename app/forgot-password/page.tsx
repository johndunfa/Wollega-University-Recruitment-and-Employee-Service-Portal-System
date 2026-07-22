"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LockKeyhole, User, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    // Basic validation
    if (!employeeId.trim() && !email.trim()) {
      setMessage({ 
        text: "Please provide either Employee ID or Email", 
        type: "error" 
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employeeId.trim(), email: email.trim() }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          text: data.message || "Reset link sent successfully! Check your email.", 
          type: "success" 
        });
        setSubmitted(true);
      } else {
        setMessage({ 
          text: data.message || "Something went wrong. Please try again.", 
          type: "error" 
        });
      }
    } catch (error: any) {
      setMessage({ 
        text: "Network error. Please check your connection and try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-blue-500 p-3 rounded-full shadow-md"
          >
            <LockKeyhole className="text-white w-8 h-8" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Forgot Password
          </h2>
          <p className="text-gray-500 text-sm text-center mt-2">
            {submitted 
              ? "Check your email for the reset link" 
              : "Enter your Employee ID or Email and we'll send you a reset link."}
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee ID */}
              <div>
                <label
                  htmlFor="employeeId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Employee ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    id="employeeId"
                    type="text"
                    placeholder="Enter your Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Check Your Email
            </h3>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address. 
              The link will expire in 1 hour for security reasons.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Try a different email address
              </button>
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                ← Back to Login
              </Link>
            </div>
          </motion.div>
        )}

        {/* Message */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === "error" 
                ? "bg-red-100 text-red-700" 
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.type === "error" ? (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}

        {/* Help Text */}
        {!submitted && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Can't access your email or don't remember your Employee ID? 
              Please contact your system administrator for assistance.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}