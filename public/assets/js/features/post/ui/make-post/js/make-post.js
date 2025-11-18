import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { isBlank, isOverMaxLength } from "../../../../../shared/lib/util/util.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { navigate } from "../../../../../shared/lib/router.js";
import { toast } from "../../../../../shared/ui/toast/js/toast.js";
import { requestMakePost } from "../../../../../shared/lib/api/post-api.js";

activeFeatureCss(cssPath.MAKE_POST_CSS_PATH);

export function makePost() {
    const root = document.createElement('div');
    root.className = 'make-post-container'
    root.innerHTML =
        `
        <div class="make-post-wrapper">
            <h2>소중한 경험을 공유해요</h2>
            <form id="make-post-form">
                <div class="make-post-field">
                    <label class="make-post-label">제목*</label>
                    <input id="make-post-form-title" name="title" class="make-post-input" required
                        placeholder="제목을 입력해주세요.(최대 26글자)">
                </div>
                <div class="make-post-field">
                    <label class="make-post-label">내용*</label>
                    <textarea id="make-post-form-article" name="article" class="make-post-input" required
                        placeholder="내용을 입력해주세요"></textarea>
                    <p id="make-post-form-helper-text"></p>
                </div>
                <div class="make-post-field">
                    <label class="make-post-label">이미지</label>
                    <div class="make-post-form-file-row">
                        <input id="make-post-form-article-image" type="file" accept="image/*" name="article-image"
                            class="make-post-input"></input>
                        <label class="make-post-file-btn" for="make-post-form-article-image">
                            파일 선택
                        </label>
                        <span class="make-post-file-text">파일을 선택해주세요</span>
                    </div>
                </div>
                <button id="make-post-btn" type="submit" disabled>완료</button>
            </form>
        </div>
        `


    const form = root.querySelector('#make-post-form');
    const titleInput = root.querySelector('#make-post-form-title');
    const articleInput = root.querySelector('#make-post-form-article');
    const articleImageInput = root.querySelector('#make-post-form-article-image');
    const articleImageTitleText = root.querySelector('.make-post-file-text');
    const helperText = root.querySelector('#make-post-form-helper-text');
    const makePostButton = root.querySelector('#make-post-btn');

    // 이벤트 리스너 등록
    // 1. 게시글 제목 Input 태그 이벤트 등록
    titleInput.addEventListener('input', () => {
        handleTitleLength();
        handleTitleAndArticleBlank();
        activeMakePostButton();
    })

    // 2. 게시글 이미지 Input태그 이벤트 등록
    articleImageInput.addEventListener('change', () => {
        console.log('input');
        handleArticleImageTitleText();
    })

    // 2. 게시글 본문 textarea 태그 이벤트 등록
    articleInput.addEventListener('input', () => {
        handleTitleAndArticleBlank();
        activeMakePostButton();
    })


    // 3. 게시글 생성 form 이벤트 등록
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('submit');
        handleMakePostRequest();
    })



    // 이벤트 리스너 콜백 함수
    // 1. 게시글 등록 버튼 활성화 핸들러
    function activeMakePostButton() {
        const title = String(titleInput.value).trim();
        const article = String(articleInput.value).trim();
        const isFilled = !isBlank(title) && !isBlank(article);

        if (!isFilled) {
            makePostButton.classList.remove('active');
            makePostButton.disabled = true;
            return;
        }

        const canActive = !isOverMaxLength(title, 26) && isFilled;
        makePostButton.classList.toggle('active', canActive);
        makePostButton.disabled = !canActive;
    }

    // 2. 게시글 제목, 본문 내용 작성 여부 확인 핸들러
    function handleTitleAndArticleBlank() {
        const title = String(titleInput.value).trim();
        const article = String(articleInput.value).trim();
        if (isBlank(title) && isBlank(article)) {
            helperText.textContent = '제목, 내용을 모두 작성해주세요';
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
    return root;

    // 4. 게시글 본문 이미지 제목 표시 핸들러
    function handleArticleImageTitleText() {
        const articleImage = articleImageInput.files[0];
        articleImageTitleText.textContent = articleImage.name;
    }

    // 5. 게시글 생성 요청 핸들러
    async function handleMakePostRequest() {
        if (makePostButton.disabled) return;

        try {
            const authorId = localStorage.getItem('currentUserId');
            const title = String(titleInput.value).trim();
            const article = String(articleInput.value).trim();
            const articleImage = articleImageInput.files[0];
            const category = "COMMUNITY";

            const response = await requestMakePost(authorId, title, article, articleImage, category);
            const responseBody = response.data;

            const toastLogic = {
                title: "소중한 경험이 공유되었어요.",
                buttonTitle: "게시글 목록 화면으로 이동",
                buttonLogic: function () {
                    navigate('/post');
                }
            }
            const toastComponent = toast(toastLogic);
            document.body.appendChild(toastComponent);

        } catch (error) {
            if (error instanceof ApiError) {
                handleMakePostFail(error);
            }
        } finally {
            activeMakePostButton();
        }
    }

    // 6. 게시글 생성 실패 핸들러
    function handleMakePostFail(error) {
        helperText.textContent = error.message;
    }
}