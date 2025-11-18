import { activeCommonCss } from "../../../lib/dom.js";
import { cssPath } from "../../../path/cssPath.js";

activeCommonCss(cssPath.COMMON_TOAST_CSS_PATH);

export function toast(toastLogic) {
    const root = document.createElement('div');
    root.className = 'toast-container';
    root.innerHTML =
        `
        <div class="toast-container">
            <div class="toast-wrapper">
                <h2 class="toast-title">${toastLogic.title}</h2>
                <button id="toast-btn">${toastLogic.buttonTitle}</button>
            </div>
        </div>
        `;

    const btn = root.querySelector('#toast-btn');

    btn.addEventListener('click', () => {
        toastLogic.buttonLogic();
        root.remove();
    })
    return root;
}