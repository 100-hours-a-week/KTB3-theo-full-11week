import { modalService, type ModalOptions } from "./modalService"
import { useModalContext } from "./ModalProvider"

export function useModal() {
    const { showModal, hideModal } = useModalContext();

    const open = (options: ModalOptions) => {
        showModal(options);
    }

    const close = () => {
        hideModal();
    }

    return {
        showModal: open,
        hideModel: close,
    }
}

export { modalService };