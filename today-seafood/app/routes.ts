import { index, route } from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("postlist", "routes/postlist.tsx"),
    route("post/:postId", "routes/postDetail.tsx"),
    route("post/:postId/edit", "routes/postEdit.tsx"),
    route("makepost", "routes/makepost.tsx"),
    route("editPassword", "routes/editPassword.tsx"),
    route("editProfile", "routes/editProfile.tsx"),
    route("notfound", "routes/not-found.tsx"),
    route("*", "routes/access-block.tsx")
];