import { createContext, useState, useCallback, useEffect, useContext, type ReactNode } from "react";
import { Toast } from "./Toast";
import { toastService, type ToastOptions } from "./toastService";

type ToastContextValue = {
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastOptions | null>(null);

    const showToast = useCallback((options: ToastOptions) => {
        setToast(options);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    useEffect(() => {
        const unsubscribe = toastService.subscribe((options) => {
            if (!options) {
                setToast(null);
                return;
            }
            setToast(options);
        });
        return unsubscribe;
    }, []);

    const contextValue: ToastContextValue = {
        showToast,
        hideToast,
    };

    const handleClick = () => {
        if (toast?.onClick) {
            toast.onClick();
        }
        hideToast();
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {toast && (
                <Toast
                    title={toast.title}
                    buttonTitle={toast.buttonTitle}
                    onClick={handleClick}
                />
            )}
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToastContext는 ToastProvider 안에서만 사용해야 합니다.");
    }
    return ctx;
}
