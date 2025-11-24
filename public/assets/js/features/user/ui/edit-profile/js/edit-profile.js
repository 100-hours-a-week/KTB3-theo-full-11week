import { activeFeatureCss } from "../../../../../shared/lib/dom.js";
import { apiPath } from "../../../../../shared/path/apiPath.js";
import { cssPath } from "../../../../../shared/path/cssPath.js";
import { isBlank, isFile, isOverMaxLength } from "../../../../../shared/lib/util/util.js";
import { ApiError } from "../../../../../shared/lib/api/api-error.js";
import { emit } from "../../../../../shared/lib/eventBus.js";
import { navigate } from "../../../../../shared/lib/router.js";
import { modal } from "../../../../../shared/ui/modal/js/modal.js";
import { toast } from "../../../../../shared/ui/toast/js/toast.js";
import { requestCurrentUser, requestNicknameDuplication, requestProfileEdit, requestDeleteUser } from "../../../../../shared/lib/api/user-api.js";

activeFeatureCss(cssPath.EDIT_PROFILE_CSS_PATH);

export async function editProfile() {
    const userId = localStorage.getItem('currentUserId');
    const responseBody = await requestCurrentUser(userId);
    const currentUser = responseBody.data;
    const root = document.createElement('div');
    root.className = 'edit-profile-container';
    root.innerHTML =
        `
        <div class="edit-profile-wrapper">
            <h2>회원정보수정</h2>
            <form id="edit-profile-form">
                <div class="edit-profile-field">
                    <label class="edit-profile-label" for="edit-profile-form-profile-image">프로필 사진*</label>
                    <input id="edit-profile-form-profile-image" type="file" accept="image/*">
                    <button id="edit-profile-image-upload-btn" type="button">
                        <img id="edit-profile-image-preview" src="${apiPath.PROFILE_IMAGE_STORATE_URL + currentUser.profileImage}">
                    </button>
                </div>
                <div class="edit-profile-field">
                    <label class="edit-profile-label">이메일*</label>
                    <p>${currentUser.email}</p>
                </div>
                <div class="edit-profile-field">
                    <label class="edit-profile-label" for="edit-profile-form-nickname">닉네임</label>
                    <input id="edit-profile-form-nickname" name="nickname" type="text" class="edit-profile-input"
                        required placeholder="닉네임을 입력하세요" value="${currentUser.nickname}">
                    <p class="edit-profile-form-helper-text"></p>
                </div>
                <button id="edit-profile-update-btn" type="submit" disabled>수정하기</button>
            </form>
            <a id="edit-profile-to-unsubscribe-link">회원 탈퇴</a>
            <button id="edit-profile-to-posts">수정완료</button>
        </div>
        `;

    const form = root.querySelector('#edit-profile-form');
    const profileImageInput = root.querySelector('#edit-profile-form-profile-image');
    const profileImagePreview = root.querySelector('#edit-profile-image-preview');
    const profileImageUploadButton = root.querySelector('#edit-profile-image-upload-btn');
    const nicknameInput = root.querySelector('#edit-profile-form-nickname');
    const profileUpdateButton = root.querySelector('#edit-profile-update-btn');
    const helpertext = root.querySelector('.edit-profile-form-helper-text')
    const unsubscribeLink = root.querySelector('#edit-profile-to-unsubscribe-link');
    const toPostListLink = root.querySelector('#edit-profile-to-posts');

    // 닉네임 중복 여부
    let isDuplicatedNickname = false;

    // 회원 프로필 수정 요청 핸들러
    async function handleEditProfileRequest() {
        if (profileUpdateButton.disabled) return;

        try {
            const userId = currentUser.id;
            const oldFileName = localStorage.getItem('profileImage');
            const profileImage = profileImageInput.files[0];
            const nickname = String(nicknameInput.value).trim();

            const response = await requestProfileEdit(userId, oldFileName, profileImage, nickname);
            const responseBody = response.data;

            const newProfileImage = responseBody.profileImage;
            localStorage.setItem('profileImage', newProfileImage);
            emit('user:editProfile', { newProfileImage });
            // 토스트 메시지 띄우기
            const toastLogic = {
                title: "수정 완료",
                buttonTitle: "닫기",
                buttonLogic: function () { }
            }
            const toastComponent = toast(toastLogic);
            document.body.appendChild(toastComponent);

        } catch (error) {
            if (error instanceof ApiError) {
                // handleEditProfileFail(error)
            }
        } finally {
            isDuplicatedNickname = true;
            activeProfileUpdateButton();
        }
    }

    // 회원 프로필 수정하기 버튼 클릭 이벤트
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        handleEditProfileRequest();
    })

    // 회원 프로필 이미지 업로드 버튼 클릭 -> 프로필 이미지 input 태그 이벤트 전달
    profileImageUploadButton.addEventListener('click', () => {
        profileImageInput.click();
    })


    // 프로필 이미지 변경 핸들러
    function handleProfileImageInput() {
        const file = profileImageInput.files[0];
        if (!isFile(file)) {
            helpertext.textContent = '이미지 파일만 업로드 가능합니다.'
            return;
        }

        helpertext.textContent = '';

        const url = URL.createObjectURL(file);
        profileImagePreview.src = url;
        return true;
    }

    // 회원 프로필 이미지 변경 이벤트
    profileImageInput.addEventListener('change', () => {
        handleProfileImageInput();
    })

    // 닉네임 유효성 검증 핸들러
    function handleInvalidNicknamePattern() {
        const nickname = (nicknameInput.value).trim();

        if (isBlank(nickname)) {
            helpertext.textContent = '닉네임을 입력해주세요'
            return false;
        }

        if (isOverMaxLength(nickname, 10)) {
            helpertext.textContent = '닉네임은 최대 10자까지 작성 가능합니다.'
            return false;
        }

        helpertext.textContent = '';
        return true;
    }

    // 프로필 업데이트 활성화 함수
    function activeProfileUpdateButton() {
        const nickname = String(nicknameInput.value).trim();
        const isFilled = !isBlank(nickname);

        if (!isFilled) {
            profileUpdateButton.classList.remove('active');
            profileUpdateButton.disabled = true;
            return;
        }

        const isAvailableNickname = !isDuplicatedNickname;
        const canActive = isAvailableNickname;

        profileUpdateButton.classList.toggle('active', canActive);
        profileUpdateButton.disabled = !canActive;
    }

    // 닉네임 input 이벤트 발생 -> 닉네임 패턴 검사
    nicknameInput.addEventListener('input', () => {
        handleInvalidNicknamePattern();
        isDuplicatedNickname = false;
        activeProfileUpdateButton();
    })


    // 닉네임 중복 검사 핸들러
    async function handleNicknameDuplication() {
        const nickname = String(nicknameInput.value).trim();

        const response = await requestNicknameDuplication(nickname);
        const responseBody = response.data;
        const isDuplicate = !responseBody.available;

        isDuplicatedNickname = isDuplicate;

        if (isDuplicate) {
            helpertext.textContent = '중복된 닉네임입니다.';
            return false;
        }

        return true;
    }

    //  닉네임 유효성 검증 완료해야 닉네임 중복 검사 API 요청
    nicknameInput.addEventListener('blur', async () => {
        const isValidNicknamePattern = handleInvalidNicknamePattern();

        if (!isValidNicknamePattern) {
            return;
        }
        await handleNicknameDuplication();
        activeProfileUpdateButton();
    })

    // 수정완료 버튼 클릭 시 게시글 목록 화면으로 이동
    toPostListLink.addEventListener('click', () => {
        navigate('/post');
    })

    // 회원탈퇴하기 버튼 클릭시 모달 창 렌더링
    unsubscribeLink.addEventListener('click', () => {
        handleUnsubscribeUser();
    })











    // 6. 회원 탈퇴 모달창 핸들러
    function handleUnsubscribeUser() {
        const handleCancelChoice = function () {
        }
        const handleConfirmChoice = async function () {
            const userId = localStorage.getItem('currentUserId');
            await requestDeleteUser(userId);
            navigate('/logout');
        }

        const modalLogic = {
            title: "회원탈퇴 하시겠습니까?",
            detail: "작성된 게시글과 댓글은 삭제됩니다.",
            cancelLogic: handleCancelChoice,
            confirmLogic: handleConfirmChoice,
        }
        const modalComponent = modal(modalLogic);
        document.body.appendChild(modalComponent);
    }



    return root;


}
