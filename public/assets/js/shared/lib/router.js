import { login } from "../../features/auth/ui/login/js/login.js"
import { logout } from "../../features/auth/ui/logout/js/logout.js";
import { signup } from "../../features/user/ui/signup/js/signup.js";
import { postCardList } from "../../features/post/ui/posts/js/post-card-list.js";
import { makePost } from "../../features/post/ui/make-post/js/make-post.js";
import { editProfile } from "../../features/user/ui/edit-profile/js/edit-profile.js";
import { editPassword } from "../../features/user/ui/edit-password/js/edit-password.js";

// 컴포넌트 히스토리 저장
let history = ['/'];

// 라우터, 경로 정보 저장
const routes = [
    { path: "/", render: login },
    { path: "/login", render: login },
    { path: "/logout", render: logout },
    { path: "/signup", render: signup },
    { path: "/post", render: postCardList },
    { path: "/makepost", render: makePost },
    { path: "/editprofile", render: editProfile },
    { path: "/editpassword", render: editPassword },
]

let nowComponent = null;
// 경로 들어오면 배열에서 Path값 비교해서 맞는 라우터 찾고 없으면 시작 페이지로 이동
function findRoute(pathname) {
    return routes.find((route) => route.path === pathname) || routes[0];
}

export async function renderRoute(path) {
    nowComponent?.cleanUp?.();

    const render = findRoute(path).render;
    const root = document.getElementById("app");
    root.innerHTML = '';
    const component = await render();
    nowComponent = component;
    root.appendChild(component);
}

export function navigate(path) {
    renderRoute(path);
    history.push(path);
}

// 뒤로 돌아가기 가능한지
export function canGoBack() {
    return history.length > 1;
}

// 뒤로 돌아가기
export function goBack() {
    if (!canGoBack()) {
        navigate('/');
        return;
    }
    history.pop();
    const previousPath = history[history.length - 1];
    renderRoute(previousPath);
}

// 방문 기록 삭제
export function clearPathHistory() {
    history = [];
    history.push('/');
}