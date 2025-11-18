import { activeCommonCss } from "../../../lib/dom.js";
import { cssPath } from "../../../path/cssPath.js";

activeCommonCss(cssPath.INTRO_CSS_PATH);

export function showIntroAnimation(onFinish) {
    // 중복 생성 방지
    if (document.querySelector('.intro-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';

    const text = document.createElement('div');
    text.className = 'intro-text';
    text.textContent = '오늘의 물고기';

    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // 애니메이션 끝나면 오버레이 제거 + ocean-bg 제거 + 콜백 실행
    text.addEventListener('animationend', () => {
        overlay.remove();

        // 👉 바다 배경도 제거해서 body의 흰색 배경만 남도록
        const oceanBg = document.querySelector('.ocean-bg');
        if (oceanBg) {
            oceanBg.remove();
        }

        if (typeof onFinish === 'function') {
            onFinish();
        }
    });
}
