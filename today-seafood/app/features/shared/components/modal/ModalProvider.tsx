import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { modalService, type ModalOptions } from "./modalService"
import { Modal } from "./Modal";

type ModalContextValue = {
    showModal: (options: ModalOptions) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalOptions | null>(null);

    const showModal = useCallback((options: ModalOptions) => {
        setModal(options);
    }, [])

    const hideModal = useCallback(() => {
        setModal(null);
    }, [])

    useEffect(() => {
        const unsubscribe = modalService.subscribe((options) => {
            if (!options) {
                setModal(null);
                return;
            }
            setModal(options);
        })
        return unsubscribe;
    })

    const contextValue: ModalContextValue = {
        showModal,
        hideModal,
    }

    const handleOnCancle = () => {
        if (modal?.onCancel) {
            modal.onCancel();
        }
        hideModal();
    }

    const handleOnConfirm = () => {
        if (modal?.onConfirm) {
            modal.onConfirm();
        }
        hideModal();
    }

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            {modal && (
                <Modal
                    title={modal.title}
                    detail={modal.detail}
                    onCancel={handleOnCancle}
                    onConfirm={handleOnConfirm}
                >
                </Modal>
            )}
        </ModalContext.Provider >
    );

}

export function useModalContext() {
    const ctx = useContext(ModalContext);
    if (!ctx) {
        throw new Error("useModalContext는 ModalProvider 안에서만 사용가능 합니다.");
    }
    return ctx;
}