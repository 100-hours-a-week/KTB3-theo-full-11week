import { index, route } from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("postlist", "routes/postlist.tsx"),
    route("makepost", "routes/makepost.tsx"),
    route("*", "routes/not-found.tsx")
];