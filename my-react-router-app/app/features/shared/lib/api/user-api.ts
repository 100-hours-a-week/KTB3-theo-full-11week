import { Api } from "./api";
import { apiPath } from "../path/apiPath";

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
    const response = await new Api()
        .post()
        .url(apiPath.LOGOUT_API_URL)
        .request();
    return response;
}

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

export async function requestCurrentUser(userId: number) {

    const response = await new Api()
        .get()
        .url(`${apiPath.FIND_USER_API_URL}/${userId}`)
        .request();
    return response;
}


export async function requestProfileEdit(userId: number, oldFileName: string | null, profileImage: File | null, nickname: string) {

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

export async function requestDeleteUser(userId: number) {
    const response = await new Api()
        .delete()
        .url(`${apiPath.DELETE_USER_API_URL}/${userId}`)
        .request()

    return response;
}

export async function requestEditPassword(userId: number, password: string) {
    const response = await new Api()
        .patch()
        .url(apiPath.EDIT_PASSWORD_API_URL(userId))
        .body({ password })
        .request();

    return response;
}
