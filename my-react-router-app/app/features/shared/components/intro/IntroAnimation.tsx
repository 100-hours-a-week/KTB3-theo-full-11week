import { useCallback } from 'react';
import "../../styles/intro/intro.css"

import { apiPath } from '../../lib/path/apiPath';
import { imagePath } from '../../lib/path/imagePath';

type IntroAnimationProps = {
    onFinish?: () => void;
};

export function IntroAnimation({ onFinish }: IntroAnimationProps) {
    const handleAnimationEnd = useCallback(() => {
        // ocean-bg 제거 (기존 로직 유지)
        const oceanBg = document.querySelector('.ocean-bg');
        if (oceanBg) {
            oceanBg.remove();
        }

        onFinish?.();
    }, [onFinish]);

    return (
        <div className="intro-overlay">
            <div className="intro-content">
                <div
                    className="intro-circle"
                    onAnimationEnd={handleAnimationEnd}
                >
                    <div className="intro-wave -one" />
                    <div className="intro-wave -two" />
                    <div className="intro-wave -three" />

                    <div className="intro-logo-group">
                        <img
                            className="intro-logo"
                            src={apiPath.TODAY_FISH_LOGO_URL + imagePath.TODAY_FISH_LOGO_PATH}
                            alt="오늘의 수산 로고"
                        />
                        <div className="intro-text">오늘의 수산</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
