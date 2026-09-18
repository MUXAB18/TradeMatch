import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ padding: '16px' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal panel */}
      <div 
        className={`relative w-full ${maxWidth} bg-white dark:bg-surface rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        style={{ maxHeight: '90vh', minWidth: '300px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8EAF0] shrink-0">
          <h2 id="modal-title" className="text-[22px] font-extrabold text-[#1D1D1F] dark:text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F8FA] dark:bg-background flex items-center justify-center text-[#6B7280] dark:text-text-secondary hover:bg-[#E8EAF0] dark:hover:bg-border hover:text-[#1D1D1F] dark:hover:text-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#9CA3AF]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
