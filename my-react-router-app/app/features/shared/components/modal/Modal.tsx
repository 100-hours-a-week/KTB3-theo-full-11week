import "../styles/modal.css";

type ModalProps = {
    title: string;
    detail: string;
    onCancel: () => void;
    onConfirm: () => void;
};

export function Modal({ title, detail, onCancel, onConfirm }: ModalProps) {
    return (
        <div className="modal-container">
            <div className="modal-wrapper">
                <h2 className="modal-title">{title}</h2>
                <p className="modal-detail">{detail}</p>
                <button
                    id="modal-cancel-btn"
                    className="modal-btn"
                    type="button"
                    onClick={onCancel}
                >
                    취소
                </button>
                <button
                    id="modal-confirm-btn"
                    className="modal-btn"
                    type="button"
                    onClick={onConfirm}
                >
                    확인
                </button>
            </div>
        </div>
    );
}
