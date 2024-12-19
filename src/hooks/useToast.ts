import { toast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const useToast = () => {
  const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
  };

  return {
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, { ...defaultOptions, ...options });
    },
    error: (message: string, options?: ToastOptions) => {
      toast.error(message, { ...defaultOptions, ...options });
    },
    loading: (message: string, options?: ToastOptions) => {
      return toast.loading(message, { ...defaultOptions, ...options });
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },
  };
};


