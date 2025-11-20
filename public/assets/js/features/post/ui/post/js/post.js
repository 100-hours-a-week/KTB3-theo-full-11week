import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { emit, eventBus } from "../../../../../shared/lib/eventBus.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { apiPath } from "../../../../../shared/path/apiPath.js";
import { commentCardList } from "./comment-card-list.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { modal } from "../../../../../shared/ui/modal/js/modal.js";
import { editPost } from "../../edit-post/js/edit-post.js";
import { requestPostDelete, requestPostDetail, requestPostLike, requestPostLikeCancel, requestIncreasePostViewCount } from "../../../../../shared/lib/api/post-api.js";

activeFeatureCss(cssPath.POST_CSS_PATH);

const VIEW_COOLTIME_MS = 10_00 * 60; // 1분
const VIEW_COOLTIME_KEY = "postViewCoolTime" // 이 키는 숨겨야 함.
export async function post(postId) {
    const responseBody = await requestPostDetail(postId); // 게시글 상세 조회
    const postDetail = responseBody.data;
    const currentUserNickname = localStorage.getItem('nickname');
    const likedPostIds = localStorage.getItem('likedPostId')?.split(',') ?? [];
    let isLikedPost = likedPostIds.includes(String(postId));
    const wasLikedInitially = isLikedPost;
    const { id, title, authorNickname,
        article, articleImage, authorImage,
        commentCount, createdAt, hit, like, category } = postDetail;


    const root = document.createElement('div');
    root.id = `post-container-${id}`;
    root.innerHTML =
        `
        <div class="post-wrapper">
            <div class="post-header-container">
                <div class="post-header-top">
                    <h2>${title}</h2>
                    <button id="post-back-btn">목록으로</button>
                </div>
                <div class="post-header-meta">
                    <div class="post-author-field">
                        <div class="post-author-profile">
                            <img id="post-author-profile-image"
                            ${authorImage ? `src="${apiPath.PROFILE_IMAGE_STORATE_URL + authorImage}"` : ''}>
                        </div>
                        <label class="post-author-nickname-field">${authorNickname}</label>
                        <p class="post-createdat">${createdAt}</p>
                    </div>
                    <div class="post-control-field">
                        <button id="post-update-btn" class="post-control-btn" ${currentUserNickname !== authorNickname ? "hidden" : ""}>수정</button>
                        <button id="post-delete-btn" class="post-control-btn" ${currentUserNickname !== authorNickname ? "hidden" : ""}>삭제</button>
                    </div>
                </div>
            </div>
            <div class="post-article-container">
                <div class="post-article-image-box">
                    <img id="post-article-image" 
                    ${articleImage ? `src="${apiPath.ARTICLE_IMAGE_STORAGE_URL + articleImage}"` : ''}>
                </div>
                <p id="post-article-text">${article}</p>
                <div class="post-article-status">
                    <div class="post-article-like-box ${isLikedPost ? "like" : ""}">
                        <label id="post-article-like">${like}</label>
                        <label>좋아요 수</label>
                    </div>
                    <div class="post-article-viewcount-box">
                        <label id="post-article-viewcount">${hit}</label>
                        <label>조회 수</label>
                    </div>
                    <div class="post-article-comment-box">
                        <label id="post-article-comment-count">${commentCount}</label>
                        <label >댓글</label>
                    </div>
                </div>
            </div>
        </div>
        `;
    root.appendChild(commentCardList(id));

    const backToListButton = root.querySelector('#post-back-btn');
    const likeBox = root.querySelector('.post-article-like-box');
    const postLikeLabel = root.querySelector('#post-article-like');
    const postViewCountLabel = root.querySelector('#post-article-viewcount');
    const commentCountLabel = root.querySelector('#post-article-comment-count');
    const postUpdateButton = root.querySelector('#post-update-btn');
    const postDeleteButton = root.querySelector('#post-delete-btn');

    increaseViewCountOnMountWithStorage(postId, postViewCountLabel);

    function getViewCoolTimeMapFromStroage() {
        try {
            const raw = localStorage.getItem(VIEW_COOLTIME_KEY);
            if (!raw) { return {} }
            const parsed = JSON.parse(raw);

            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch (error) {
            console.log(error);
            return {};
        }
    }

    function saveViewCoolTimeMapToStorage(map) {
        try {
            localStorage.setItem(VIEW_COOLTIME_KEY, JSON.stringify(map));
        } catch (e) {
            console.log(e);
        }
    }

    async function increaseViewCountOnMountWithStorage(postId, postViewCountLabel) {
        const postIdStr = String(postId);
        const now = Date.now();

        const coolTimeMap = getViewCoolTimeMapFromStroage();
        const lastViewedAt = coolTimeMap[postIdStr];

        if (typeof lastViewedAt === 'number') {
            const diff = now - lastViewedAt;
            if (diff < VIEW_COOLTIME_MS) {
                return;
            }
        }

        try {
            const response = await requestIncreasePostViewCount(postId);
            const currentView = Number(postViewCountLabel.textContent);
            postViewCountLabel.textContent = currentView + 1;

            coolTimeMap[postIdStr] = now;
            saveViewCoolTimeMapToStorage(coolTimeMap);

        } catch (error) {
            if (error instanceof ApiError) {

            }
        }
    }


    async function requestPostLikeChange() {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) return;

        const postIdStr = String(postId);
        const isActive = likeBox.classList.contains('like');

        if (!wasLikedInitially && isActive) {
            await requestPostLike(postId, userId);

            if (!likedPostIds.includes(postIdStr)) {
                likedPostIds.push(postIdStr);
            }
            localStorage.setItem('likedPostId', likedPostIds.join(','));
            return;
        }

        if (wasLikedInitially && !isActive) {
            await requestPostLikeCancel(postId, userId);

            const deleteIndex = likedPostIds.indexOf(postIdStr);
            if (deleteIndex !== -1) {
                likedPostIds.splice(deleteIndex, 1);
            }
            localStorage.setItem('likedPostId', likedPostIds.join(','));
            return;
        }
    }
    // 뒤로 가기 버튼
    backToListButton.addEventListener('click', () => {
        requestPostLikeChange();
        const nowCommentCount = Number(commentCountLabel.textContent);
        const nowViewCount = Number(postViewCountLabel.textContent);
        const nowLikeCount = Number(postLikeLabel.textContent);
        emit('post:backToList', { postId, nowCommentCount, nowViewCount, nowLikeCount });

    })

    // 댓글 생성 시 댓글 수 증가 핸들러
    const handleCreateComment = (event) => {
        const nowCommentCount = Number(commentCountLabel.textContent);
        commentCountLabel.textContent = nowCommentCount + 1;
    };
    // 댓글 삭제 시 댓글 수 감소 핸들러
    const handleDeleteComment = (event) => {
        const nowCommentCount = Number(commentCountLabel.textContent);
        commentCountLabel.textContent = nowCommentCount - 1;
    };

    // 댓글 생성 시 댓글 수 증가 이벤트
    eventBus.addEventListener('post:createComment', handleCreateComment)

    // 댓글 삭제 시 댓글 수 감소 이벤트
    eventBus.addEventListener('post:deleteComment', handleDeleteComment)


    // 게시글 좋아요 클릭 핸들러
    async function handlePostLikeBoxUpdate() {
        const currentLikeCount = Number(postLikeLabel.textContent);
        const isActive = likeBox.classList.contains('like');

        if (isLikedPost) {
            if (isActive) {
                likeBox.classList.remove('like');
                postLikeLabel.textContent = currentLikeCount - 1;
                isLikedPost = false;
            } else {

            }
        } else {
            if (!isActive) {
                likeBox.classList.add('like');
                postLikeLabel.textContent = currentLikeCount + 1;
                isLikedPost = true;
            }
        }
    }

    // 게시글 좋아요 클릭 이벤트
    likeBox.addEventListener('click', (event) => {
        event.preventDefault();
        handlePostLikeBoxUpdate()
    })

    // 게시글 삭제 확인 모달창 핸들러
    function handlePostDelete() {
        const handleCancelChoice = function () {

        }

        const handleConfirmChoice = async function () {
            await requestPostDelete(postId)
            emit('post:deletePost', { postId });
        }

        const modalLogic = {
            title: "게시글을 삭제하시겠습니까?",
            detail: "삭제한 내용은 복구할 수 없습니다.",
            cancelLogic: handleCancelChoice,
            confirmLogic: handleConfirmChoice,
        }

        const modalComponent = modal(modalLogic);
        document.body.appendChild(modalComponent);
    }

    postUpdateButton.addEventListener('click', (event) => {
        event.preventDefault();

        eventBus.removeEventListener('post:createComment', handleCreateComment);
        eventBus.removeEventListener('post:deleteComment', handleDeleteComment);

        const editPostComponent = editPost({ id, title, article, articleImage, category });
        root.innerHTML = '';
        root.appendChild(editPostComponent);
    })

    postDeleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        handlePostDelete()
    })
    return root;
}
