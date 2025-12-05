import { subscribe } from "diagnostics_channel";

export type ModalOptions = {
    title: string;
    detail: string;
    onCancel: () => void;
    onConfirm: () => void;
};

type Listener = (modal: ModalOptions | null) => void;

let listener: Listener | null = null;

export const modalService = {
    subscribe(fn: Listener) {
        listener = fn;
        return () => {
            if (listener === fn) {
                listener = null;
            }
        }
    },

    show(modal: ModalOptions) {
        listener?.(modal);
    },

    claer() {
        listener?.(null);
    }
}