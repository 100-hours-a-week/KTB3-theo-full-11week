import { useNavigate } from "react-router-dom";
import { requestLogout } from "~/features/shared/lib/api/user-api";
import { accessTokenStore } from "~/features/shared/lib/jwt/access-token";
import { toastService, useToast } from "../../components/toast/useToast";

export function useLogout() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    return async function logout() {
        try {
            await requestLogout();
        } catch (error) {

        }
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImage");
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("likedPostId");

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