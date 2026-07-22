// app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface UserType {
  name: string;
  employeeId: string;
  email: string;
  role: string;
  position: string;
  department: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Properly decode URL parameters
  const token = decodeURIComponent(searchParams.get('token') || '');
  const employeeId = decodeURIComponent(searchParams.get('id') || '');

  const [user, setUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if token and employeeId are present
    if (!token || !employeeId) {
      setMessage({ 
        text: 'Invalid reset link. Please request a new password reset.', 
        type: 'error' 
      });
      return;
    }

    console.log('URL parameters - Token:', token, 'Employee ID:', employeeId);

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/get-user-by-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: employeeId }),
        });

        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser({
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          employeeId: data.employeeId || 'N/A',
          role: data.role || 'Employee',
          department: data.department || 'N/A',
          position: data.position || 'N/A',
        });
      } catch (err) {
        console.error(err);
        setMessage({ 
          text: 'Failed to verify user. Please try again.', 
          type: 'error' 
        });
      }
    };

    fetchUser();
  }, [token, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (password !== confirmPassword) {
      setMessage({ 
        text: 'Passwords do not match.', 
        type: 'error' 
      });
      return;
    }

    if (password.length < 6) {
      setMessage({ 
        text: 'Password must be at least 6 characters.', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token.trim(), 
          employeeId: employeeId.trim(), 
          newPassword: password 
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          text: data.message || 'Password reset successfully! Redirecting to login...', 
          type: 'success' 
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({ 
          text: data.message || 'Something went wrong. Please try again.', 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setMessage({ 
        text: err.message || 'Network error. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold">Reset Password</h2>
        </div>

        {user && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Resetting password for <span className="font-semibold">{user.name}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">{user.email}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-gray-500" />
              ) : (
                <Eye size={18} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} className="text-gray-500" />
              ) : (
                <Eye size={18} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>

        {message.text && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>Token: {token.substring(0, 10)}... (for debugging)</p>
          <p>Employee ID: {employeeId}</p>
        </div>
      </motion.form>
    </div>
  );
}