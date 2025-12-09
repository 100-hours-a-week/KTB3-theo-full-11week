export type ToastOptions = {
  title: string;
  buttonTitle: string;
  onClick?: () => void;
};

type Listener = (toast: ToastOptions | null) => void;

let listener: Listener | null = null;

export const toastService = {
  subscribe(fn: Listener) {
    listener = fn;
    return () => {
      if (listener === fn) {
        listener = null;
      }
    };
  },

  show(toast: ToastOptions) {
    listener?.(toast);
  },

  clear() {
    listener?.(null);
  },
};
