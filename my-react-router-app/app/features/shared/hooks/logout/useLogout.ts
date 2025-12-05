import { useNavigate } from "react-router-dom";
import { requestLogout } from "~/features/shared/lib/api/user-api";
import { accessTokenStore } from "~/features/shared/lib/jwt/access-token";
import { toastService, useToast } from "../toast/useToast";
import { LOCAL_STORAGE_KEY } from "../../lib/util/localstorage";

export function useLogout() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    return async function logout() {
        try {
            await requestLogout();
        } catch (error) {

        }
        localStorage.removeItem(LOCAL_STORAGE_KEY.NICKNAME);
        localStorage.removeItem(LOCAL_STORAGE_KEY.PROFILE_IMAGE);
        localStorage.removeItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID);
        localStorage.removeItem(LOCAL_STORAGE_KEY.LIKED_POST_ID);
        localStorage.removeItem(LOCAL_STORAGE_KEY.POST_VIEW_COOL_TIME);

        accessTokenStore.clear();

        showToast({
            title: "로그아웃 되었습니다",
            buttonTitle: "닫기",
            onClick() {
                toastService.clear();
                navigate('/login', { replace: true });
            }
        })
    }
}