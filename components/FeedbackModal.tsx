import React, { useRef, useEffect } from 'react';

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
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
        className="relative w-full max-w-md p-8 bg-white/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/30 focus:outline-none flex flex-col items-center"
        tabIndex={0}
        aria-label="Feedback Modal"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 flex items-center justify-center bg-white/60 rounded-full shadow mb-2">
            <span className="text-2xl" aria-label="mail icon">📧</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 text-center">Instructions have been sent to your email.</h2>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white font-semibold shadow focus:ring-2 focus:ring-blue-400 focus:outline-none"
          aria-label="Close feedback modal"
        >
          Close
        </button>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close feedback modal"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal; 