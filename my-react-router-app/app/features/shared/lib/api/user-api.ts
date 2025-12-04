import { Api } from "./api";
import { apiPath } from "../path/apiPath";

// 로그인 API 요청
export async function requestLogin(email: string, password: string) {
    const response = await new Api()
        .post()
        .url(apiPath.LOGIN_API_URL)
        .body({
            email,
            password,
        })
        .print()
        .request();
    return response;

}
export async function requestLogout() {
    await new Api()
        .post()
        .url(apiPath.LOGOUT_API_URL)
        .request();
}

// 이메일 중복 검사 요청 API
export async function requestEmailDuplication(email: string) {
    const response = await new Api()
        .post()
        .url(apiPath.EMAIL_DOUBLE_CHECK_API_URL)
        .body({
            email: email
        })
        .request();

    return response;
}

// 닉네임 중복 검사 요청 API
export async function requestNicknameDuplication(nickname: string) {
    const response = await new Api()
        .post()
        .url(apiPath.NICKNAME_DOUBLE_CHECK_API_URL)
        .body({
            nickname: nickname
        })
        .request();

    return response;
}

// 회원가입 API 요청
export async function requestSignup(email: string, password: string, nickname: string, profileImage: File) {
    const response = await new Api()
        .post()
        .url(apiPath.SIGNUP_API_URL)
        .body({
            email,
            password,
            nickname,
            profileImage,
        })
        .toFormData()
        .request();

    return response;
}

// 현재 유저 정보 조회 요청 API
export async function requestCurrentUser(userId: number) {

    const response = await new Api()
        .get()
        .url(`${apiPath.FIND_USER_API_URL}/${userId}`)
        .request();
    return response;
}


// 회원 프로필 수정 요청 API
export async function requestProfileEdit(userId: number, oldFileName: string, profileImage: File, nickname: string) {

    const response = await new Api()
        .patch()
        .url(`${apiPath.EDIT_USER_API_URL}/${userId}`)
        .body({
            nickname: nickname,
            oldFileName: oldFileName,
            profileImage: profileImage,
        })
        .toFormData()
        .request();

    return response;
}

// 회원 삭제 요청 API
export async function requestDeleteUser(userId: number) {
    const response = await new Api()
        .delete()
        .url(`${apiPath.DELETE_USER_API_URL}/${userId}`)
        .request()

    return response;
}

// 비밀번호 수정 요청 API
export async function requestEditPassword(userId: number, password: string) {
    const response = await new Api()
        .patch()
        .url(apiPath.EDIT_PASSWORD_API_URL(userId))
        .body({ password })
        .request();

    return response;
}
