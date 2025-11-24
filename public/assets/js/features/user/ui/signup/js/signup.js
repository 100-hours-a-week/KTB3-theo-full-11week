import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { navigate } from "../../../../../shared/lib/router.js";
import { isEmail, isValidPasswordPattern, isBetweenLength, isBlank, isOverMaxLength, isFile } from "../../../../../shared/lib/util/util.js";
import { toast } from "../../../../../shared/ui/toast/js/toast.js";
import { requestEmailDuplication, requestNicknameDuplication, requestSignup } from "../../../../../shared/lib/api/user-api.js";

activeFeatureCss(cssPath.SIGNUP_CSS_PATH);

export function signup() {
    const root = document.createElement('div');
    root.className = "signup-form-container"
    root.innerHTML =
        `
        <div class="signup-form-wrapper">
            <h2>회원가입</h2>
            <form id="signup-form">
                <div class="signup-field signup-profile-field">
                    <label class="signup-label" for="signup-form-profile-image">프로필 사진</label>
                    <p class="signup-form-helper-text helper-profile-image"></p>
                    <input id="signup-form-profile-image" type="file" accept="image/*">
                    <button id="signup-image-upload-btn" type="button">+</button>
                </div>
                <div class="signup-field">
                    <label class="signup-label" for="signup-form-email">이메일*</label>
                    <input id="signup-form-email" name="email" type="email" class="signup-input" required
                        placeholder="이메일을 입력하세요">
                    <p class="signup-form-helper-text helper-email"></p>
                </div>
                <div class="signup-field">
                    <label class="signup-label" for="signup-form-password">비밀번호*</label>
                    <input id="signup-form-password" name="password" type="password" class="signup-input" required
                        placeholder="비밀번호를 입력하세요">
                    <p class="signup-form-helper-text helper-password"></p>
                </div>
                <div class="signup-field">
                    <label class="signup-label" for="signup-form-password-confirm">비밀번호 확인*</label>
                    <input id="signup-form-password-confirm" name="password" type="password" class="signup-input"
                        required placeholder="비밀번호를 한 번 더 입력하세요">
                    <p class="signup-form-helper-text helper-password-confirm"></p>
                </div>
                <div class="signup-field">
                    <label class="signup-label" for="signup-form-nickname">닉네임*</label>
                    <input id="signup-form-nickname" name="nickname" type="text" class="signup-input" required
                        placeholder="닉네임을 입력하세요">
                    <p class="signup-form-helper-text helper-nickname"></p>
                </div>
                <button id="signup-btn" type="submit" disabled>회원가입</button>
            </form>
            <a id="signup-to-login-link" href="/login">로그인하러 가기</a>
        </div>
    `

    const form = root.querySelector('#signup-form');
    const profileImageInput = root.querySelector('#signup-form-profile-image');
    const profileImageUploadButton = root.querySelector('#signup-image-upload-btn');
    const emailInput = root.querySelector('#signup-form-email');
    const passwordInput = root.querySelector('#signup-form-password');
    const passwordConfirmInput = root.querySelector('#signup-form-password-confirm');
    const nicknameInput = root.querySelector('#signup-form-nickname');
    const signupButton = root.querySelector('#signup-btn');
    const loginLink = root.querySelector('#signup-to-login-link');
    const helperTexts = {};

    root.querySelectorAll('.signup-form-helper-text')
        .forEach((elemenet) => {
            const helperClass = Array.from(elemenet.classList)
                .find(cls => cls.startsWith('helper-'));

            if (helperClass) {
                const key = helperClass.replace('helper-', '');
                helperTexts[key] = elemenet;
            }
        });

    // 닉네임 중복 여부
    let isAvailableNickname = false;
    // 이메일 중복 여부
    let isAvailableEmail = false;


    // 회원가입 요청 핸들러
    async function handleSignupRequest() {
        if (signupButton.disabled) return;

        try {
            const email = String(emailInput.value).trim();
            const password = String(passwordInput.value).trim();
            const nickname = String(nicknameInput.value).trim();
            const profileImage = profileImageInput.files[0];

            const response = await requestSignup(email, password, nickname, profileImage);
            const responseBody = response.data;
            const toastLogic = {
                title: "회원가입이 완료되었습니다.",
                buttonTitle: "로그인 화면으로 이동",
                buttonLogic: function () {
                    navigate('/logout');
                }
            }
            const toastComponent = toast(toastLogic);
            document.body.appendChild(toastComponent);

        } catch (error) {
            if (error instanceof ApiError) {
                // handleSignupFail(error);
            }
        } finally {
            activeSignUpButton();
        }
    }

    // 회원가입 폼 이벤트 등록
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSignupRequest();
    })

    // 회원 프로필 이미지 업로드 버튼 이벤트 등록
    profileImageUploadButton.addEventListener('click', () => {
        profileImageInput.click();
    })

    // 9. 프로필 이미지 입력 처리 핸들러
    function handleProfileImageInput() {
        const file = profileImageInput.files[0];
        profileImageUploadButton.classList.remove('upload');
        if (!file) {
            profileImageUploadButton.innerHTML = '+';
            helperTexts['profile-image'].textContent = '';
            return;
        }

        if (!isFile(file)) {
            profileImageUploadButton.innerHTML = '+';
            helperTexts['profile-image'].textContent = '이미지 파일만 업로드 가능합니다.'
            return;
        }

        helperTexts['profile-image'].textContent = '';

        const url = URL.createObjectURL(file);
        profileImageUploadButton.classList.add('upload');
        profileImageUploadButton.innerHTML =
            `
                <img id="sign-form-preview" src="${url}"/>
            `;
    }

    // 프로필 이미지 첨부 확인 검증 핸들러
    function handleInvalidProfileImage() {
        const profileImage = profileImageInput.files[0];
        if (!profileImage) {
            helperTexts['profile-image'].textContent = '프로필 사진을 추가해주세요';
            return false;
        } else {
            helperTexts['profile-image'].textContent = '';
        }
        return true;
    }

    // 회원 프로필 이미지 첨부 input 태그 이벤트 등록
    profileImageInput.addEventListener('change', () => {
        handleProfileImageInput();
        handleInvalidProfileImage();
    })


    // 이메일 유효성 검증 핸들러
    function handleInvalidEmail() {
        const email = String(emailInput.value).trim();
        if (isBlank(email)) {
            helperTexts['email'].textContent = '이메일을 입력해주세요';
            return false;
        }
        if (!isEmail(email)) {
            helperTexts['email'].innerHTML = '올바른 이메일 주소 형식을 입력해주세요. example@example.com'
            return false;
        } else {
            helperTexts['email'].textContent = '';
        }
        return true;
    }

    // 회원가입 버튼 활성화
    function activeSignUpButton() {
        const email = String(emailInput.value).trim();
        const password = String(passwordInput.value).trim();
        const passwordConfirm = String(passwordConfirmInput.value).trim();
        const nickname = String(nicknameInput.value).trim();
        const profileImage = profileImageInput.files[0];

        const isFilled = email && password && passwordConfirm && nickname;

        // 입력 폼이 모두 채워진 경우
        if (!isFilled) {
            signupButton.classList.remove('active');
            signupButton.disabled = true;
            return;
        }

        // 유효성 검증
        const isEmailValid = handleInvalidEmail();
        const isPassowordValid = handleInvalidPassword();
        const isEqualPassword = handleEqualPasswordInput();
        const isProfileImageValid = handleInvalidProfileImage();

        const canActive = isEmailValid && isPassowordValid && isEqualPassword && isAvailableEmail && isAvailableNickname && isProfileImageValid;
        signupButton.classList.toggle('active', canActive);
        signupButton.disabled = !canActive;
    }

    // 이메일 이벤트 등록
    emailInput.addEventListener('input', () => {
        handleInvalidEmail();
        isAvailableEmail = false;
        activeSignUpButton();
    })

    // 이메일 중복 검증 핸들러
    async function handleEmailDuplication() {
        const email = String(emailInput.value).trim();

        const response = await requestEmailDuplication(email);
        const responseBody = response.data;
        const isAvailable = responseBody.available;

        if (!isAvailable) {
            helperTexts['email'].textContent = '중복된 이메일입니다.'
            return false;
        }

        helperTexts['email'].textContent = ''
        return true;
    }

    //  이메일 input 태그 이벤트 등록(blur)
    emailInput.addEventListener('blur', async () => {
        // 이메일 유효성 검증 완료해야 중복 검사API 요청
        const isValidEmail = handleInvalidEmail();
        if (!isValidEmail) {
            return;
        }
        isAvailableEmail = await handleEmailDuplication();
        activeSignUpButton();
    })

    // 패스워드 유효성 검증 핸들러
    function handleInvalidPassword() {
        const password = String(passwordInput.value).trim();
        if (isBlank(password)) {
            helperTexts['password'].textContent = '비밀번호를 입력해주세요';
            return false;
        }
        if (!isValidPasswordPattern(password) || !isBetweenLength(password, 8, 20)) {
            helperTexts['password'].textContent = '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            return false;
        } else {
            helperTexts['password'].textContent = '';
        };

        return true;
    }

    // 비밀번호와 비밀번호 확인 입력이 같은 지 검증
    function handleEqualPasswordInput() {
        const password = String(passwordInput.value).trim();
        const passwordConfirm = String(passwordConfirmInput.value).trim();

        if (isBlank(passwordConfirm)) {
            helperTexts['password-confirm'].textContent = '비밀번호를 한 번 더 입력해주세요.'
            return false;
        }

        if (password !== passwordConfirm) {
            helperTexts['password-confirm'].textContent = '비밀번호가 다릅니다.'
            return false;
        } else {
            helperTexts['password-confirm'].textContent = ''
        }
        return true;
    }

    //패스워드 이벤트 등록
    passwordInput.addEventListener('input', () => {
        handleInvalidPassword();
        handleEqualPasswordInput()
        activeSignUpButton();
    })

    // 패스워드 확인 input 태그 이벤트 등록
    passwordConfirmInput.addEventListener('input', () => {
        handleEqualPasswordInput()
        activeSignUpButton();
    })

    // 닉네임 유효성 검증 핸들러
    function handleInvalidNicknamePattern() {
        const nickname = String(nicknameInput.value).trim();

        if (isBlank(nickname)) {
            helperTexts['nickname'].textContent = '닉네임을 입력해주세요'
            return false;
        }
        if (isOverMaxLength(nickname, 10)) {
            helperTexts['nickname'].textContent = '닉네임을 최대 10자까지 작성 가능합니다.'
            return false;
        }
        if (nickname.includes(' ')) {
            helperTexts['nickname'].textContent = '띄워쓰기를 없애주세요'
            return false;
        }

        helperTexts['nickname'].textContent = ''
        return true;
    }

    // 닉네임 input 태그 이벤트 등록(input)
    nicknameInput.addEventListener('input', () => {
        handleInvalidNicknamePattern();
        isAvailableNickname = false;
        activeSignUpButton();
    })

    // 닉네임 중복 검증 핸들러
    async function handleNicknameDuplication() {
        const nickname = String(nicknameInput.value).trim();

        const response = await requestNicknameDuplication(nickname);
        const responseBody = response.data;
        const isAvailable = responseBody.available;

        if (!isAvailable) {
            helperTexts['nickname'].textContent = '중복된 닉네임입니다.'
            return false;
        }

        helperTexts['nickname'].textContent = ''
        return true;
    }

    //  닉네임 유효성 검증 완료해야 닉네임 중복 검사 API 요청
    nicknameInput.addEventListener('blur', async () => {
        const isValidNickname = handleInvalidNicknamePattern();
        if (!isValidNickname) {
            return;
        }
        isAvailableNickname = await handleNicknameDuplication();
        activeSignUpButton();
    })

    // '로그인 하러가기' a태그 이벤트 등록(click)
    loginLink.addEventListener('click', (event) => {
        event.preventDefault();
        navigate('/login');
    })

    return root;
}