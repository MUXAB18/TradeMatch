import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ToastComponent from '../components/Toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastState {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType, id?: string) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType, id?: string) => {
    const toastId = id || Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const exists = prev.find((t) => t.id === toastId);
      if (exists) {
        return prev.map((t) => (t.id === toastId ? { ...t, message, type } : t));
      }
      return [...prev, { id: toastId, message, type }];
    });
    return toastId;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      >
        <View style={styles.toastContainer} pointerEvents="box-none">
          {toasts.map((toast) => (
            <ToastComponent
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onHide={() => hideToast(toast.id)}
            />
          ))}
        </View>
      </KeyboardAvoidingView>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 9999,
    paddingTop: 16,
  },
});
