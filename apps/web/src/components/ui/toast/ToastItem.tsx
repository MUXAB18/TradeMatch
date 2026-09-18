'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Toast } from './types';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast: t, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const remainingTime = useRef(t.duration === Infinity ? Infinity : t.duration || 4000);
  const lastUpdateTime = useRef(Date.now());

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(t.id), 250);
  };

  useEffect(() => {
    if (t.duration === Infinity) return;
    const totalDuration = t.duration || 4000;

    const startTimer = () => {
      lastUpdateTime.current = Date.now();
      progressInterval.current = setInterval(() => {
        const now = Date.now();
        remainingTime.current -= now - lastUpdateTime.current;
        lastUpdateTime.current = now;
        if (remainingTime.current <= 0) {
          clearInterval(progressInterval.current!);
          handleClose();
        }
      }, 10);
    };

    if (!isPaused) startTimer();

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPaused, t.duration, t.id]);

  // Icon and color config per type
  const typeConfig = {
    success: {
      icon: <CheckCircle2 size={18} className="text-white" />,
      iconBg: 'bg-emerald-500',
    },
    error: {
      icon: <XCircle size={18} className="text-white" />,
      iconBg: 'bg-red-500',
    },
    warning: {
      icon: <AlertTriangle size={18} className="text-white" />,
      iconBg: 'bg-amber-500',
    },
    info: {
      icon: <Info size={18} className="text-white" />,
      iconBg: 'bg-[#6366f1]',
    },
    loading: {
      icon: <Loader2 size={18} className="text-white animate-spin" />,
      iconBg: 'bg-[#6366f1]',
    },
  };

  const config = typeConfig[t.type];

  return (
    <div
      role={t.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`
        pointer-events-auto
        flex items-center gap-3
        bg-white dark:bg-[#1c1c1e]
        border border-black/[0.06] dark:border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        rounded-full
        pl-2 pr-3 py-2
        transition-all duration-250 ease-out will-change-transform
        ${isExiting
          ? 'opacity-0 scale-90 translate-y-2'
          : 'opacity-100 scale-100 translate-y-0'
        }
      `}
      style={{
        animation: isExiting ? undefined : 'toastIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Circular icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}>
        {config.icon}
      </div>

      {/* Message */}
      <div className="flex items-baseline gap-1 min-w-0">
        {t.title && (
          <span className="text-[14px] font-bold text-gray-900 dark:text-white whitespace-nowrap">{t.title}</span>
        )}
        <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200 leading-tight">
          {t.message}
        </span>
      </div>

      {/* Action button or dismiss */}
      {t.action ? (
        <button
          onClick={(e) => {
            t.action!.onClick(e);
            handleClose();
          }}
          className="ml-1 shrink-0 px-3 py-1.5 rounded-full bg-[#6366f1]/12 dark:bg-[#6366f1]/20 text-[13px] font-bold text-[#6366f1] hover:bg-[#6366f1]/20 transition-colors whitespace-nowrap"
        >
          {t.action.label}
        </button>
      ) : (
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="ml-1 shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
