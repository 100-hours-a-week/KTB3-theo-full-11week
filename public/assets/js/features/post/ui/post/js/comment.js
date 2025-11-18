import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { apiPath } from "../../../../../shared/path/apiPath.js";
import { emit } from "../../../../../shared/lib/eventBus.js";
import { modal } from "../../../../../shared/ui/modal/js/modal.js";
import { requestCommentDelete } from "../../../../../shared/lib/api/post-api.js";

activeFeatureCss(cssPath.COMMENT_CSS_PATH);

export function comment(commentData, postId) {
    const currentUserNickname = localStorage.getItem('nickname');
    const { id, authorId, authorNickname, authorProfileImage, updatedAt, content } = commentData;
    const root = document.createElement('div');
    root.className = 'comment-container';
    root.id = `comment-${id}`;
    root.innerHTML =
        `
        <div class="comment-wrapper">
            <div class="comment-author-profile-field ${authorId}">
                <img id="comment-author-profile-image"
                ${authorProfileImage ? `src="${apiPath.PROFILE_IMAGE_STORATE_URL + authorProfileImage}"` : ''}>
            </div>
            <div class="comment-main">
                <div class="comment-author-field">
                    <label class="comment-author-nickname">${authorNickname}</label>
                    <label class="comment-updatedat">${updatedAt}</label>
                </div>
                <div class="comment-content-field">
                    <p class="comment-content">${content}</p>
                </div>
            </div>
            <div class="comment-control-field">
                <button id="comment-update-btn" class="comment-control-btn" ${currentUserNickname !== authorNickname ? "hidden" : ''}>수정</button>
                <button id="comment-delete-btn" class="comment-control-btn" ${currentUserNickname !== authorNickname ? "hidden" : ''}>삭제</button>
            </div>
        </div>
        `;

    const commentUpdateButton = root.querySelector('#comment-update-btn');
    const commentDeleteButton = root.querySelector('#comment-delete-btn');
    const contentEl = root.querySelector('.comment-content');

    commentUpdateButton.addEventListener('click', () => {
        const currentContent = contentEl.textContent;
        emit('post:startEditComment', {
            commentId: id,
            content: currentContent,
            element: root,
        })
    })

    // 댓글 삭제 버튼 이벤트 등록
    commentDeleteButton.addEventListener('click', () => {
        handleCommentDelete();
    })

    // 댓글 삭제 모달창 핸들러
    function handleCommentDelete() {
        const handleCancelChoice = function () {

        }
        const handleConfirmChoice = async function () {
            await requestCommentDelete(postId, id);
            emit('post:deleteComment', { element: root });
        }

        const modalLogic = {
            title: "댓글을 삭제하시겠습니까?",
            detail: "삭제한 내용은 복구할 수 없습니다.",
            cancelLogic: handleCancelChoice,
            confirmLogic: handleConfirmChoice,
        }

        const modalComponent = modal(modalLogic);
        document.body.appendChild(modalComponent)
    }

    return root;
}