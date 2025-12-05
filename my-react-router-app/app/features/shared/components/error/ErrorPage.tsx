// app/features/shared/components/error/ErrorPage.tsx
import { useEffect, type ReactNode } from "react";
import "../../styles/error/error.css"

type ErrorPageProps = {
    code?: number | string;
    title: string;
    description: string;
    hint?: string;
    primaryLabel?: string;
    secondaryLabel?: string;
    onPrimary?: () => void;
    onSecondary?: () => void;
    extra?: ReactNode;
};

export function ErrorPage({
    code,
    title,
    description,
    hint,
    primaryLabel,
    secondaryLabel,
    onPrimary,
    onSecondary,
    extra,
}: ErrorPageProps) {

    useEffect(() => {
        if (typeof document === "undefined") return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prev;
        };
    }, []);
    return (
        <div className="error-page-container">
            <div className="error-page-bg" />

            <div className="error-page-card">
                <header className="error-page-header">
                    {code && <div className="error-page-code">{code}</div>}
                    <div className="error-page-header-text">
                        <h1 className="error-page-title">{title}</h1>
                    </div>
                </header>

                <section className="error-page-body">
                    <p className="error-page-description">{description}</p>
                    {hint && <p className="error-page-hint">{hint}</p>}
                    {extra && <div className="error-page-extra">{extra}</div>}
                </section>

                <footer className="error-page-actions">
                    {primaryLabel && onPrimary && (
                        <button
                            type="button"
                            className="error-page-btn error-page-btn-primary"
                            onClick={onPrimary}
                        >
                            {primaryLabel}
                        </button>
                    )}

                    {secondaryLabel && onSecondary && (
                        <button
                            type="button"
                            className="error-page-btn error-page-btn-secondary"
                            onClick={onSecondary}
                        >
                            {secondaryLabel}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}
