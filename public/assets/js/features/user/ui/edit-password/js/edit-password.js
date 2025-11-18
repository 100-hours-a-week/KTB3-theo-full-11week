import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { isBetweenLength, isBlank, isValidPasswordPattern } from "../../../../../shared/lib/util/util.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { navigate } from "../../../../../shared/lib/router.js";
import { toast } from "../../../../../shared/ui/toast/js/toast.js";
import { requestEditPassword } from "../../../../../shared/lib/api/user-api.js";

activeFeatureCss(cssPath.EDIT_PASSWORD_CSS_PATH);

export function editPassword() {
    const root = document.createElement('div');
    root.className = 'edit-password-container';
    root.innerHTML =
        `
        <div class="edit-password-wrapper">
            <h2>비밀번호 수정</h2>
            <form id="edit-password-form">
                <div class="edit-password-field">
                    <label class="edit-password-label" for="edit-password-form-password">비밀번호</label>
                    <input id="edit-password-form-password" name="password" type="password" class="edit-password-input"
                        required placeholder="비밀번호를 입력하세요" />
                </div>
                <p class="edit-password-form-helper-text helper-password"></p>
                <div class="edit-password-field">
                    <label class="edit-password-label" for="edit-password-form-password">비밀번호 확인</label>
                    <input id="edit-password-form-password-confirm" name="password-confirm" type="password"
                        class="edit-password-input" required placeholder="비밀번호를 한 번 더 입력하세요" />
                </div>
                <p class="edit-password-form-helper-text helper-password-confirm"></p>
                <button id="edit-password-btn" type='submit' disabled>수정하기</button>
            </form>
        </div>
        `;

    const form = root.querySelector('#edit-password-form');
    const passwordInput = root.querySelector('#edit-password-form-password');
    const passwordConfirmInput = root.querySelector('#edit-password-form-password-confirm');
    const passwordEditButton = root.querySelector('#edit-password-btn');
    const helperTexts = {};

    // 헬퍼 텍스트 간소화
    root.querySelectorAll('.edit-password-form-helper-text')
        .forEach((element) => {
            const helperClass = Array.from(element.classList)
                .find(cls => cls.startsWith('helper-'));

            if (helperClass) {
                const key = helperClass.replace('helper-', "");
                helperTexts[key] = element;
            }
        })

    // 비밀번호 수정 form 이벤트 등록
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleEditPasswordRequest();
    })

    // 비밀번호 input 태그 이벤트 등록
    passwordInput.addEventListener('input', () => {
        handlePasswordInput()
        activePasswordEditButton();
    })

    // 비밀번호 확인 input 태그 이벤트 등록
    passwordConfirmInput.addEventListener('input', () => {
        handlePasswordConfirmInput();
        activePasswordEditButton();
    })

    // 핸들러 함수
    // 1. 비밀번호 수정 버튼 활성화
    function activePasswordEditButton() {
        const password = String(passwordInput.value).trim();
        const passwordConfirm = String(passwordConfirmInput.value).trim();

        const isFilled = !isBlank(password) && !isBlank(passwordConfirm);

        if (!isFilled) {
            passwordEditButton.classList.remove('active');
            passwordEditButton.disabled = true;
            return;
        }

        const isPassowordValid = handlePasswordInput();
        const isPasswordConfirmValid = handlePasswordConfirmInput();
        const canActive = isPassowordValid && isPasswordConfirmValid;
        passwordEditButton.classList.toggle('active', canActive);
        passwordEditButton.disabled = !canActive;
    }

    // 2. 비밀번호 입력 검증 핸들러
    function handlePasswordInput() {
        const password = String(passwordInput.value).trim();
        const passwordConfirm = String(passwordConfirmInput.value).trim();
        if (isBlank(password)) {
            helperTexts['password'].textContent = '비밀번호를 입력해주세요';
            return false;
        }

        if (!isValidPasswordPattern(password) || !isBetweenLength(password, 8, 20)) {
            helperTexts['password'].textContent = '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            return false;
        }

        if (password !== passwordConfirm) {
            helperTexts['password'].textContent = '비밀번호 확인과 다릅니다.';
            return false;
        } else {
            helperTexts['password'].textContent = '';
        };

        return true;
    }

    // 3. 비밀번호 확인 입력 검증 핸들러
    function handlePasswordConfirmInput() {
        const password = String(passwordInput.value).trim();
        const passwordConfirm = String(passwordConfirmInput.value).trim();

        if (isBlank(passwordConfirm)) {
            helperTexts['password-confirm'].textContent = '비밀번호를 한 번 더 입력해주세요.'
            return false;
        }

        if (password !== passwordConfirm) {
            helperTexts['password-confirm'].textContent = '비밀번호와 다릅니다.'
            return false;
        } else {
            helperTexts['password-confirm'].textContent = ''
        }
        return true;
    }

    // 4. 비밀번호 수정 요청 핸들러
    async function handleEditPasswordRequest() {
        if (passwordEditButton.disabled) return;

        const userId = localStorage.getItem('currentUserId');
        const password = String(passwordInput.value).trim();

        try {
            const response = await requestEditPassword(userId, password);
            const responseBody = response.data;
            console.log(responseBody);

            const toastLogic = {
                title: "수정 완료",
                buttonTitle: "로그인 화면 이동",
                buttonLogic: function () {
                    navigate('/login');
                }
            }
            const toastComponent = toast(toastLogic);
            document.body.appendChild(toastComponent);

        } catch (error) {
            if (error instanceof ApiError) {

            }
        } finally {
            activePasswordEditButton();
        }
    }

    return root;
}