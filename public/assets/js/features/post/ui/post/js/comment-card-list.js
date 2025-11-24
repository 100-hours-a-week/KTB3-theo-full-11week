import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { isBlank, getNowData } from "../../../../../shared/lib/util/util.js";
import { comment } from "./comment.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { emit, eventBus } from "../../../../../shared/lib/eventBus.js";
import { requestUpdateComment, requestFindComments, requestCreateComment } from "../../../../../shared/lib/api/post-api.js";

activeFeatureCss(cssPath.COMMENT_CARD_LIST_CSS_PATH);

export function commentCardList(postId) {
    // 현재 페이지
    let currentPage = 0;
    // 페이지당 컨텐츠 개수
    const size = 10;
    // 다음 페이지 여부
    let hasNext = true;
    // 페이지 로딩 플래그
    let isLoading = false;

    // 수정모드 여부
    let isEditMode = false;
    // 현재 수정중인 댓글 PK
    let editingCommentId = null;
    // 현재 수정중인 댓글 엘리먼트
    let editingCommentElement = null;

    const root = document.createElement('div');
    root.className = 'comment-card-list-container';
    root.innerHTML =
        `
         <div class="comment-card-list-wrapper">
            <form id="comment-form">
            <div class="comment-field" >
                <textarea id="comment-form-content" placeholder="댓글을 남겨주세요!"></textarea>
                <button id="comment-form-create-btn" type="submit">댓글 등록</button>
                <button id="comment-form-update-btn" type="submit">댓글 수정</button>
            </div>
            </form>
        </div>
        `;

    const form = root.querySelector('#comment-form');
    const commentTextArea = root.querySelector('#comment-form-content');
    const commentCreateButton = root.querySelector('#comment-form-create-btn');
    const commentUpdateButton = root.querySelector('#comment-form-update-btn');
    const commentListWrapper = root.querySelector('.comment-card-list-wrapper');


    // 옵저버 감지 대상 박스 생성 - sentinel
    const sentinel = document.createElement('div');
    sentinel.className = 'comment-card-list-sentinel';
    root.appendChild(sentinel);

    let nowObserver = null;
    addObserver(); // 옵저버 등록
    loadNextPage(); // 초기 페이지 렌더링

    // 무한 스크롤용 옵저버 추가

    function addObserver() {
        nowObserver = new IntersectionObserver(async (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoading && hasNext) {
                await loadNextPage();
            }
        }, { threshold: 0.5 });

        nowObserver.observe(sentinel);
    }

    // 무한 스크롤 페이지 로딩 함수
    async function loadNextPage() {
        try {
            if (isLoading || !hasNext) {
                return;
            }

            isLoading = true;

            const response = await requestFindComments(postId, currentPage, size);
            const responseBody = response.data;
            console.log(responseBody);

            // 댓글 컴포넌트 렌더링, 삽입
            const contents = responseBody.contents;
            const fragment = document.createDocumentFragment();
            contents.forEach((item) => {
                fragment.append(comment(item, postId));
            });
            root.insertBefore(fragment, sentinel);

            // 다음 로드 페이지 미리 계산
            currentPage = responseBody.currentPage + 1;
            // 다음 페이지 여부
            hasNext = responseBody.hasNext;
        } catch (error) {
            if (error instanceof ApiError) {

            }
        } finally {
            isLoading = false;
        }
    }

    // 댓글 업데이트 요청 핸들러
    async function handleUpdateCommentRequest() {
        if (!isEditMode || !editingCommentId || !editingCommentElement) {
            return;
        }
        try {
            const content = String(commentTextArea.value).trim();

            const response = await requestUpdateComment(postId, editingCommentId, content);
            const responseBody = response.data;

            const contentEl = editingCommentElement.querySelector('.comment-content');
            const updatedAtEl = editingCommentElement.querySelector('.comment-updatedat')

            contentEl.textContent = responseBody.content;
            updatedAtEl.textContent = responseBody.updatedAt;

            resetEditMode();
        } catch (error) {
            if (error instanceof ApiError) {

            }
        }
    }

    // 수정 모드 초기화
    function resetEditMode() {
        isEditMode = false;
        editingCommentId = null;
        editingCommentElement = null;

        commentTextArea.value = '';

        commentUpdateButton.style.display = 'none';
        commentCreateButton.style.display = 'inline-block';

        activeCommentSubmitButton();
    }

    // 댓글 생성 요청 핸들러
    async function handleCreateCommentRequest() {
        if (commentCreateButton.disabled) return;

        try {
            const userId = localStorage.getItem('currentUserId');
            const content = String(commentTextArea.value).trim();
            const response = await requestCreateComment(postId, userId, content);
            const responseBody = response.data;

            const newCommentData = {
                id: responseBody.id,
                authorId: userId,
                authorNickname: localStorage.getItem('nickname'),
                authorProfileImage: localStorage.getItem('profileImage'),
                updatedAt: getNowData(),
                content: responseBody.content,
            }
            const newComment = comment(newCommentData, postId);
            commentListWrapper.after(newComment);
            commentTextArea.value = '';
            emit('post:createComment', {});
        } catch (error) {
            if (error instanceof ApiError) {

            }
        } finally {
            activeCommentSubmitButton();
        }
    }

    // 댓글 생성 버튼 클릭 이벤트
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isEditMode) {
            await handleUpdateCommentRequest();
        } else {
            await handleCreateCommentRequest();
        }
    })

    // 댓글 생성, 수정 버튼 활성화 검사 핸들러
    function activeCommentSubmitButton() {
        const content = String(commentTextArea.value).trim();
        const isFilled = !isBlank(content);

        commentCreateButton.classList.remove('active');
        commentCreateButton.disabled = true;
        commentUpdateButton.classList.remove('active');
        commentUpdateButton.disabled = true;

        if (!isFilled) {
            return;
        }

        const targetButton = isEditMode ? commentUpdateButton : commentCreateButton;
        targetButton.classList.add('active');
        targetButton.disabled = false;
    }

    // 댓글 입력 창 입력 감지
    commentTextArea.addEventListener('input', () => {
        activeCommentSubmitButton();
    })

    // 댓글 입력 창 블러 이벤트 등록
    commentTextArea.addEventListener('blur', () => {
        activeCommentSubmitButton();
    })


    function deleteCommentHandler(event) {
        const deletedComment = event.detail.element;
        root.removeChild(deletedComment);
    }
    // 댓글 삭제 이벤트 시 삭제 대상 댓글 컨테이너 삭제
    eventBus.addEventListener('post:deleteComment', deleteCommentHandler)


    function startEditCommentHandler(event) {
        const { commentId, content, element } = event.detail;

        isEditMode = true;
        editingCommentId = commentId;
        editingCommentElement = element;

        commentTextArea.value = content;
        commentTextArea.focus();

        commentCreateButton.style.display = 'none';
        commentUpdateButton.style.display = 'inline-block';

        activeCommentSubmitButton();
    }
    // 댓글 수정 모드 변경 이벤트 등록
    eventBus.addEventListener('post:startEditComment', startEditCommentHandler);


    const customEvent = [
        { type: 'post:deleteComment', handler: deleteCommentHandler },
        { type: 'post:startEditComment', handler: startEditCommentHandler },
    ]

    root.cleanUp = function () {
        customEvent.forEach((customEvent) => {
            eventBus.removeEventListener(customEvent.type, customEvent.handler);
        })
        // 옵저버 지우기
        if (nowObserver) {
            nowObserver.disconnect();
            nowObserver = null;
        }
    }

    return root;
}