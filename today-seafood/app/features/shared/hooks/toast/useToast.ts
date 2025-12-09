import { toastService, type ToastOptions } from "../../components/toast/toastService"
import { useToastContext } from "../../components/toast/ToastProvider"

export function useToast() {
  const { showToast, hideToast } = useToastContext();

  const open = (options: ToastOptions) => {
    showToast(options);
  };

  const close = () => {
    hideToast();
  };

  return {
    showToast: open,
    hideToast: close,
  };
}

export { toastService };
