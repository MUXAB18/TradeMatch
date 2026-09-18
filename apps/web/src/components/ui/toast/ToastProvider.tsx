'use client';

import React from 'react';
import { ToastContainer } from './ToastContainer';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
