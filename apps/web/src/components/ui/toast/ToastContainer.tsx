'use client';

import React, { useEffect, useState } from 'react';
import { toastStore } from './store';
import { Toast } from './types';
import { ToastItem } from './ToastItem';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastStore.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    // Fixed, centered horizontally, bottom-center on mobile, center-screen offset on desktop
    <div
      className="fixed inset-x-0 top-[80px] z-[9999] flex flex-col items-center gap-2.5 pointer-events-none px-4"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={(id) => toastStore.removeToast(id)}
        />
      ))}
    </div>
  );
}
