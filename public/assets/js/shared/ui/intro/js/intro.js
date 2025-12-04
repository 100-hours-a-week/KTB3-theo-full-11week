import { activeCommonCss } from "../../../lib/dom.js";
import { cssPath } from "../../../path/cssPath.js";
import { apiPath } from "../../../path/apiPath.js";
import { imagePath } from "../../../path/imagePath.js";

activeCommonCss(cssPath.INTRO_CSS_PATH);

export function showIntroAnimation(onFinish) {
    // 중복 생성 방지
    if (document.querySelector('.intro-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';

    const content = document.createElement('div');
    content.className = 'intro-content';

    const circle = document.createElement('div');
    circle.className = 'intro-circle';

    const waveOne = document.createElement('div');
    waveOne.className = 'intro-wave -one';

    const waveTwo = document.createElement('div');
    waveTwo.className = 'intro-wave -two';

    const waveThree = document.createElement('div');
    waveThree.className = 'intro-wave -three';

    const group = document.createElement('div');
    group.className = 'intro-logo-group';

    const logo = document.createElement('img');
    logo.className = 'intro-logo';
    logo.src = apiPath.TODAY_FISH_LOGO_URL + imagePath.TODAY_FISH_LOGO_PATH;
    logo.alt = '오늘의 물고기 로고';

    const text = document.createElement('div');
    text.className = 'intro-text';
    text.textContent = '오늘의 수산';

    group.appendChild(logo);
    group.appendChild(text);

    // ✅ 배지 안에 파도 + 그룹 순서대로 넣기 (파도가 뒤, 로고/텍스트가 앞)
    circle.appendChild(waveOne);
    circle.appendChild(waveTwo);
    circle.appendChild(waveThree);
    circle.appendChild(group);

    content.appendChild(circle);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // ✅ 인트로 애니메이션 끝나면 오버레이 제거
    circle.addEventListener('animationend', () => {
        overlay.remove();

        const oceanBg = document.querySelector('.ocean-bg');
        if (oceanBg) {
            oceanBg.remove();
        }

        if (typeof onFinish === 'function') {
            onFinish();
        }
    });
}
