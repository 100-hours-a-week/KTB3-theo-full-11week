import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { emit, eventBus } from "../../../../../shared/lib/eventBus.js";
import { apiPath } from "../../../../../shared/path/apiPath.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";

activeFeatureCss(cssPath.POST_CARD_CSS_PATH);

export function postCard(post) {
    const { id, title, like, commentCount, hit, createdAt, authorImage, authorNickname } = post;

    const root = document.createElement("div");
    root.className = 'post-card-container';
    root.id = `post-card-${id}`;
    root.innerHTML =
        `
        <div class="post-card-wrapper">
            <button class="post-card-detail-btn">
                <div class="post-card-summary-field">
                    <h2 class="post-card-summary-title">${title}</h2>
                    <div class="post-card-summary-info">
                        <label class="post-card-summary-like">좋아요 ${like}</label>
                        <label class="post-card-summary-comment">댓글 ${commentCount}</label>
                        <label class="post-card-summary-viewcount">조회 수 ${hit}</label>
                        <label class="post-card-summary-createdat">${createdAt}</label>
                    </div>
                </div>
                <div class="post-card-author-field">
                    <div class="post-card-author-profile">
                        <img ${authorImage ? `src="${apiPath.PROFILE_IMAGE_STORATE_URL + authorImage}"` : ''}>
                    </div>
                    <div class="post-card-author-nickname">${authorNickname}</div>
                </div>
            </button>
        </div>
        `;

    const postCardLikeCount = root.querySelector('.post-card-summary-like');
    const postCardCommentCount = root.querySelector('.post-card-summary-comment');
    const postCardViewCount = root.querySelector('.post-card-summary-viewcount');

    // Post Card 클릭 시, Post 상세화면 전환 이벤트
    root.addEventListener('click', (event) => {
        event.preventDefault();
        const postId = id;
        emit('post:postCardClick', { postId });
    })


    function updatePostCardHandler(event) {
        const { nowCommentCount, nowViewCount, nowLikeCount } = event.detail;
        postCardLikeCount.textContent = `좋아요 ${nowLikeCount}`;
        postCardCommentCount.textContent = `댓글 ${nowCommentCount} `;
        postCardViewCount.textContent = `조회 수 ${nowViewCount} `;

    }
    eventBus.addEventListener(`post:updatePostCard/${id}`, updatePostCardHandler);

    const customEvent = [
        { type: `post:updatePostCard/${id}`, handler: updatePostCardHandler }
    ]

    root.cleanUp = function () {
        customEvent.forEach((customEvent) => {
            eventBus.removeEventListener(customEvent.type, customEvent.handler.updatePostCardHandler);
        })
    }
    return root;
}