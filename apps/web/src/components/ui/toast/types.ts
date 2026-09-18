import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastPosition = 
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left';

export interface ToastAction {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms. Infinity for no auto-dismiss
  action?: ToastAction;
  position?: ToastPosition;
  createdAt: number;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  duration?: number;
  action?: ToastAction;
  position?: ToastPosition;
}

// Store observer type
export type ToastStoreListener = (toasts: Toast[]) => void;
