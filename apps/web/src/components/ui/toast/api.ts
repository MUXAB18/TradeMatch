import { toastStore } from './store';
import { Toast, ToastOptions, ToastType } from './types';

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => `toast_${Date.now()}_${idCounter++}`;

const createToast = (type: ToastType, message: string, options?: ToastOptions): string => {
  const id = options?.id || generateId();
  
  // Default durations based on type
  let defaultDuration = 4000;
  if (type === 'error') defaultDuration = 6000;
  if (type === 'warning') defaultDuration = 5000;
  if (type === 'loading') defaultDuration = Infinity;

  const toast: Toast = {
    id,
    type,
    message,
    title: options?.title,
    duration: options?.duration !== undefined ? options.duration : defaultDuration,
    action: options?.action,
    position: options?.position || 'top-right',
    createdAt: Date.now(),
  };

  // If ID exists, we update it (useful for promises/loading transitions)
  const existing = toastStore.getToasts().find(t => t.id === id);
  if (existing) {
    toastStore.updateToast(id, toast);
  } else {
    toastStore.addToast(toast);
  }

  return id;
};

export const toast = {
  success: (message: string, options?: ToastOptions) => createToast('success', message, options),
  error: (message: string, options?: ToastOptions) => createToast('error', message, options),
  warning: (message: string, options?: ToastOptions) => createToast('warning', message, options),
  info: (message: string, options?: ToastOptions) => createToast('info', message, options),
  loading: (message: string, options?: ToastOptions) => createToast('loading', message, options),
  
  dismiss: (id?: string) => {
    if (id) {
      toastStore.removeToast(id);
    } else {
      toastStore.clearAll();
    }
  },

  promise: async <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastOptions
  ) => {
    const id = toast.loading(msgs.loading, options);
    try {
      const data = await promise;
      const successMsg = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
      toast.success(successMsg, { ...options, id });
      return data;
    } catch (err) {
      const errorMsg = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      toast.error(errorMsg, { ...options, id });
      throw err;
    }
  }
};
