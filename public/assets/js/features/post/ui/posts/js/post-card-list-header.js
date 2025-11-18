import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { navigate } from "../../../../../shared/lib/router.js";

activeFeatureCss(cssPath.POST_CARD_LIST_HEADER_CSS_PATH);

export function postCardListHeader() {
    const root = document.createElement('div');
    root.className = 'post-card-list-header';
    root.innerHTML =
        `
        <div class="post-card-title-box">
            <p>오늘의 물고기에서,<br>오늘의 <strong>시세</strong>와<strong>이야기</strong>를 나눠보세요</p>
            <button id="post-card-create-btn">경험 나누기</button>
        </div>
        `

    const postCreateButton = root.querySelector('#post-card-create-btn');

    // 게시글 작성 버튼 클릭시, 게시글 작성 페이지로 이동
    postCreateButton.addEventListener('click', (event) => {
        event.preventDefault();
        navigate('/makepost');
    })

    return root;
}