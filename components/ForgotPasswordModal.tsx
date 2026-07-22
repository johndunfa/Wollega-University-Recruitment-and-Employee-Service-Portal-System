import React, { useRef, useEffect } from 'react';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" aria-modal="true" role="dialog" tabIndex={-1}>
      <div
        ref={modalRef}
        className="relative w-full max-w-md p-8 bg-white/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/30 focus:outline-none"
        tabIndex={0}
        aria-label="Forgot Password Modal"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 flex items-center justify-center bg-white/60 rounded-full shadow mb-2">
            <span className="text-2xl" aria-label="key icon">🔑</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Forgot Password</h2>
          <p className="text-gray-600 text-center text-sm">Enter your Employee ID to receive reset instructions.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Employee ID</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">#</span>
              <input
                type="text"
                name="employeeId"
                required
                autoComplete="username"
                className="pl-8 pr-3 py-2 w-full rounded-lg border border-gray-300 bg-white/60 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 placeholder-gray-400"
                placeholder="Enter your Employee ID"
                aria-label="Employee ID"
              />
            </div>
          </label>
          <button
            type="submit"
            className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white font-semibold shadow focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label="Send Reset Instructions"
          >
            Send Reset Instructions
          </button>
        </form>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close forgot password modal"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 