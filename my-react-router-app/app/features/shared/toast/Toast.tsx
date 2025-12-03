// app/features/shared/toast/Toast.tsx
import "../styles/toast.css";

export type ToastProps = {
    title: string;
    buttonTitle: string;
    onClick: () => void;
};

export function Toast({ title, buttonTitle, onClick }: ToastProps) {
    return (
        <div className="toast-container">
            <div className="toast-wrapper">
                <h2 className="toast-title">{title}</h2>
                <button
                    id="toast-btn"
                    type="button"
                    onClick={onClick}
                >
                    {buttonTitle}
                </button>
            </div>
        </div>
    );
}
