import { Toast, ToastStoreListener } from './types';

class ToastStore {
  private toasts: Toast[] = [];
  private listeners: Set<ToastStoreListener> = new Set();
  private maxVisible = 4;

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  subscribe(listener: ToastStoreListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  addToast(toast: Toast) {
    // Prevent duplicate messages spamming
    const isDuplicate = this.toasts.some(t => 
      t.message === toast.message && t.type === toast.type
    );
    
    if (isDuplicate) {
      // Find the duplicate, update its timestamp to reset its duration, and move it to top
      this.toasts = this.toasts.filter(t => !(t.message === toast.message && t.type === toast.type));
    }

    this.toasts = [toast, ...this.toasts].slice(0, this.maxVisible);
    this.notify();
  }

  updateToast(id: string, updates: Partial<Toast>) {
    this.toasts = this.toasts.map((toast) => 
      toast.id === id ? { ...toast, ...updates } : toast
    );
    this.notify();
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  clearAll() {
    this.toasts = [];
    this.notify();
  }
  
  getToasts() {
    return this.toasts;
  }
}

export const toastStore = new ToastStore();
