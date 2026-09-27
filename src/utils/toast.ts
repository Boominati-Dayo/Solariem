import toast from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  // Filter out cryptic system/SSL errors
  if (message.includes('error:0A000438') || message.includes('tlsv1 alert internal error') || message.includes('SSL routines')) {
    toast.error('A secure connection error occurred. Please try again later.');
    return;
  }
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};






