import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { isBlank, isOverMaxLength } from "../../../../../shared/lib/util/util.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { toast } from "../../../../../shared/ui/toast/js/toast.js";
import { navigate } from "../../../../../shared/lib/router.js";
import { requestEditPost } from "../../../../../shared/lib/api/post-api.js";

activeFeatureCss(cssPath.EDIT_POST_CSS_PATH);

export function editPost(post) {

    const { id, title, article, articleImage, category } = post;

    const root = document.createElement('div');
    root.className = 'edit-post-container';
    root.innerHTML =
        `
        <div class="edit-post-wrapper">
            <h2>게시글 수정</h2>
            <form id="edit-post-form">
                <div class="edit-post-field">
                    <label class="edit-post-label">제목*</label>
                    <input id="edit-post-form-title" name="title" value="${title}" class="edit-post-input" required
                        placeholder="제목을 입력해주세요.(최대 26글자)">
                </div>
                <div class="edit-post-field">
                    <label class="edit-post-label">내용*</label>
                    <textarea id="edit-post-form-article" name="article"class="edit-post-input" required
                        placeholder="내용을 입력해주세요">${article}</textarea>
                    <p id="edit-post-form-helper-text"></p>
                </div>
                <div class="edit-post-field">
                    <label class="edit-post-label">이미지</label>
                    <div class="edit-post-form-file-row">
                        <input id="edit-post-form-article-image" type="file" accept="image/*" name="article-image"
                            class="edit-post-input"></input>
                        <label class="edit-post-file-btn" for="edit-post-form-article-image">
                            파일 선택
                        </label>
                        <span class="edit-post-file-text">
                            ${articleImage ? articleImage : '파일을 선택해주세요.'}
                        </span>
                    </div>
                    <input type="hidden" id="edit-post-old-article-image"
                    value="${articleImage ?? ''}">
                </div>
                <button id="edit-post-btn" type="submit" disabled>완료</button>
            </form>
        </div>
        `;

    const form = root.querySelector('#edit-post-form');
    const titleInput = root.querySelector('#edit-post-form-title');
    const articleInput = root.querySelector('#edit-post-form-article');
    const fileInput = root.querySelector('#edit-post-form-article-image');
    const helperText = root.querySelector('#edit-post-form-helper-text');
    const oldImageInput = root.querySelector('#edit-post-old-article-image');
    const editPostButton = root.querySelector('#edit-post-btn');
    const fileText = root.querySelector('.edit-post-file-text');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleEditPostRequest();
        const toastLogic = {
            title: "수정 완료",
            buttonTitle: "게시글 목록으로 이동",
            buttonLogic: function () {
                navigate('/post');
            }
        }
        const toastComponent = toast(toastLogic);
        document.body.appendChild(toastComponent);
    })


    // 게시글 제목 Input 태그 이벤트 등록
    titleInput.addEventListener('input', () => {
        handleTitleLength();
        handleTitleAndArticleBlank();
        activeEditPostButton();
    })

    // 게시글 본문 textarea 태그 이벤트 등록
    articleInput.addEventListener('input', () => {
        handleTitleAndArticleBlank();
        activeEditPostButton();
    })

    // 게시글 이미지 파일 변경 이벤트
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];

        if (file) {
            fileText.textContent = file.name;
        } else {
            fileText.textContent = articleImage || '파일을 선택해주세요';
        }
    })

    // 핸들러 함수
    // 1. 게시글 수정 요청 버튼 활성화
    function activeEditPostButton() {
        const title = String(titleInput.value).trim();
        const article = String(articleInput.value).trim();
        const isFilled = !isBlank(title) && !isBlank(article);

        if (!isFilled) {
            editPostButton.classList.remove('active');
            editPostButton.disabled = true;
            return;
        }

        const canActive = !isOverMaxLength(title, 26) && isFilled;
        editPostButton.classList.toggle('active', canActive);
        editPostButton.disabled = !canActive;
    }

    // 2. 게시글 제목, 본문 내용 작성 여부 확인 핸들러
    function handleTitleAndArticleBlank() {
        const title = String(titleInput.value).trim();
        const article = String(articleInput.value).trim();
        if (isBlank(title) && isBlank(article)) {
            helperText.textContent = '제목, 내용을 모두 작성해주세요.'
            return;
        }
    }

    // 3. 게시글 제목 길이 확인 핸들러
    function handleTitleLength() {
        const title = String(titleInput.value).trim();
        if (isOverMaxLength(title, 26)) {
            helperText.textContent = '제목은 최대 26자 입니다.';
            return;
        } else {
            helperText.textContent = '';
        }
    }

    // 4. 게시글 수정 요청 핸들러
    async function handleEditPostRequest() {
        if (editPostButton.disabled) return;

        try {
            const title = String(titleInput.value).trim();
            const article = String(articleInput.value).trim();
            const newFile = fileInput.files[0];
            const oldFileName = oldImageInput.value;

            const response = await requestEditPost(id, title, article, oldFileName, newFile, category);
            const responseBody = response.data;
            console.log(responseBody);

        } catch (error) {
            if (error instanceof ApiError) {

            }
        } finally {
            activeEditPostButton();
        }
    }



    return root;
}