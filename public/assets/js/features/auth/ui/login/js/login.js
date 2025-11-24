import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { navigate } from "../../../../../shared/lib/router.js";
import { isEmail, isValidPasswordPattern, isBlank, isBetweenLength } from "../../../../../shared/lib/util/util.js";
import { emit } from "../../../../../shared/lib/eventBus.js";
import { requestLogin } from "../../../../../shared/lib/api/user-api.js";

activeFeatureCss(cssPath.LOGIN_CSS_PATH);

export function login() {
    const root = document.createElement("div");
    root.className = "login-container";
    root.innerHTML =
        `<div class="login-wrapper">
            <h2>로그인</h2>
            <div>
                <form id="login-form">
                    <div class="login-field">
                        <label class="login-label" for="login-form-email">이메일</label>
                        <input id="login-form-email" name="email" type="email" class="login-input" 
                        required placeholder="이메일을 입력하세요"/>
                    </div>
                    <div class="login-field">
                        <label class="login-label" for="login-form-password">비밀번호</label>
                        <input id="login-form-password" name="password" type="password" class="login-input" 
                        required placeholder="비밀번호를 입력하세요"/>
                    </div>
                    <p id="login-form-helper-text"></p>
                    <button id="login-btn" type='submit' disabled>로그인</button>
                </form>
                <a id="login-to-signup-link" href="/signup" class="router-link"> 회원가입</a>
            </div>
        </div>`;


    const form = root.querySelector('#login-form');
    const emailInput = root.querySelector('#login-form-email');
    const passwordInput = root.querySelector('#login-form-password');
    const loginButton = root.querySelector('#login-btn');
    const helperText = root.querySelector('#login-form-helper-text');
    const signUpLink = root.querySelector('#login-to-signup-link');



    // 로그인 요청
    async function handleLoginRequest() {
        if (loginButton.disabled) return;

        try {
            const email = String(emailInput.value).trim();
            const password = String(passwordInput.value).trim();

            const response = await requestLogin(email, password);
            const responseBody = response.data;
            const isLoginSuccess = responseBody.loginSuccess;
            const nickname = responseBody.nickname;
            const profileImage = responseBody.profileImage;
            const likedPostIds = responseBody.likedPostIds;
            console.log(likedPostIds);

            console.log(responseBody);
            if (isLoginSuccess) {
                // TODO: 로그인 성공 시 게시글 목록화면으로 라우팅 처리 필요
                localStorage.setItem('currentUserId', responseBody.id);
                localStorage.setItem('profileImage', profileImage);
                localStorage.setItem('nickname', nickname);
                localStorage.setItem('likedPostId', likedPostIds);
                console.log(localStorage.getItem('likedPostId'));

                emit('user:login', { profileImage });

                navigate('/post');
            } else {
                helperText.textContent = '로그인 정보가 맞지 않습니다.';
            }
        } catch (error) {
            if (error instanceof ApiError) {
                handleLoginFail(error);
            }
        }
    }

    // 로그인 실패 핸들러
    function handleLoginFail(error) {
        helperText.textContent = error.message;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleLoginRequest();
    })


    // 이메일 유효성 검증 핸들러
    function handleInvalidEmail() {
        const email = String(emailInput.value).trim();
        if (isBlank(email)) {
            helperText.textContent = '이메일을 입력해주세요';
            return;
        }
        if (!isEmail(email)) {
            helperText.textContent = '올바른 이메일 주소 형식을 입력해주세요. example@example.com';
            return;
        }
        helperText.textContent = '';
    }

    // 로그인 버튼 활성화 검사 핸들러
    function activeLoginButton() {
        const email = String(emailInput.value).trim();
        const password = String(passwordInput.value).trim();
        const isFilled = !isBlank(email) && !isBlank(password);

        if (!isFilled) {
            loginButton.classList.remove('active');
            loginButton.disabled = true;
            return;
        }

        const canActive = isEmail(email) && isValidPasswordPattern(password)
            && isBetweenLength(password, 8, 20);
        loginButton.classList.toggle('active', canActive);
        loginButton.disabled = !canActive;
    }
    // 이메일 이벤트 등록
    emailInput.addEventListener('input', () => {
        handleInvalidEmail();
        activeLoginButton();
    });

    // 패스워드 유효성 검증 핸들러
    function handleInvalidPassword() {
        const password = String(passwordInput.value).trim();
        if (isBlank(password)) {
            helperText.textContent = '비밀번호를 입력해주세요';
            return;
        }
        if (!isValidPasswordPattern(password) || !isBetweenLength(password, 8, 20)) {
            helperText.textContent = '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            return;
        }

        helperText.textContent = '';
    }

    // 패스워드 이벤트 등록
    passwordInput.addEventListener('input', () => {
        handleInvalidPassword();
        activeLoginButton();
    });


    // 4. 회원가입 페이지 이동 이벤트 등록
    signUpLink.addEventListener('click', (event) => {
        event.preventDefault();
        navigate('/signup');
    })

    return root;
}
