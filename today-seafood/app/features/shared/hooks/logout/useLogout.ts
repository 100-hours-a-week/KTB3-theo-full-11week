import { useNavigate } from "react-router-dom";
import { requestLogout } from "~/features/shared/lib/api/user-api";
import { accessTokenStore } from "~/features/shared/lib/jwt/access-token";
import { toastService, useToast } from "../toast/useToast";
import { LOCAL_STORAGE_KEY } from "../../lib/util/localstorage";
import { useUserContext } from "../../lib/context/UserContext";

export function useLogout() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setUser } = useUserContext();

    const clearLocalStorage = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY.NICKNAME);
        localStorage.removeItem(LOCAL_STORAGE_KEY.PROFILE_IMAGE);
        localStorage.removeItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID);
        localStorage.removeItem(LOCAL_STORAGE_KEY.LIKED_POST_ID);
        localStorage.removeItem(LOCAL_STORAGE_KEY.POST_VIEW_COOL_TIME);
    }

    const claerAccessTokenStore = () => {
        accessTokenStore.clear();
    }

    const logoutWithNoRedirect = async () => {
        try {
            await requestLogout();
        } catch (error) {

        }
        clearLocalStorage();
        claerAccessTokenStore();
        setUser(null);
    }

    const logoutWithoutModal = async () => {
        try {
            await requestLogout();
        } catch (error) {
        }
        clearLocalStorage();
        claerAccessTokenStore();
        setUser(null);
        navigate('/login', { replace: true })
    }

    const logoutWithModal = async () => {
        try {
            await requestLogout();
        } catch (error) {

        }
        clearLocalStorage();
        claerAccessTokenStore();
        setUser(null);
        showToast({
            title: "로그아웃 되었습니다",
            buttonTitle: "닫기",
            onClick() {
                toastService.clear();
                navigate('/login', { replace: true });
            }
        })
    }

    return {
        logoutWithoutModal,
        logoutWithModal,
        logoutWithNoRedirect,
    }
}