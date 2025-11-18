import { login } from "./features/auth/ui/login/js/login.js";
import { commonHeader } from "./shared/ui/common-header/js/common-header.js";
import { navigate } from "./shared/lib/router.js";
import { showIntroAnimation } from "./shared/ui/intro/js/intro.js";

const header = document.getElementById("header");
// const app = document.getElementById("app");

header.appendChild(commonHeader());
// app.appendChild(login());

showIntroAnimation(() => {
    navigate('/');
})
