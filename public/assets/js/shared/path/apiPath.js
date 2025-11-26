// API 요청 경로
export const apiPath = {
    API_SERVER_URL: 'https://localhost:8443',

    // Image Storage
    PROFILE_IMAGE_STORATE_URL: 'https://localhost:8443/images/profile/',
    ARTICLE_IMAGE_STORAGE_URL: 'https://localhost:8443/images/article/',
    TODAY_FISH_LOGO_URL: 'https://localhost:8443/images/logo/',

    // Auth
    LOGIN_API_URL: '/auth/access/token',
    ACCESS_TOKEN_REFRESH_API_URL: '/auth/access/token/refresh',

    //User
    SIGNUP_API_URL: '/user',
    FIND_USER_API_URL: '/user',
    EDIT_USER_API_URL: '/user',
    EMAIL_DOUBLE_CHECK_API_URL: '/user/email/double-check',
    NICKNAME_DOUBLE_CHECK_API_URL: '/user/nickname/double-check',
    NICKNAME_EDIT_API_URL: (userId) => `/user/${userId}/nickname`,
    EDIT_PASSWORD_API_URL: (userId) => `/user/${userId}/password`,
    DELETE_USER_API_URL: '/user',

    //Post
    POST_CARD_LIST_API_URL: '/post',
    MAKE_POST_API_URL: '/post',
    POST_DETAIL_API_URL: (postId) => `/post/${postId}`,
    POST_LIKE_API_URL: (postId) => `/post/${postId}/like`,
    POST_LIKE_CANCEL_API_URL: (postId) => `/post/${postId}/like/cancel`,
    DELETE_POST_API_URL: (postId) => `/post/${postId}`,
    EDIT_POST_API_URL: (postId) => `/post/${postId}`,
    INCREASE_POST_VIEW_COUNT_API_URL: (postId) => `/post/${postId}/hit`,

    // Comment
    CREATE_COMMENT_API_URL: (postId) => `/post/${postId}/comment`,
    FIND_COMMENTS_API_URL: (postId) => `/post/${postId}/comment`,
    DELETE_COMMENT_API_URL: (postId, commentId) => `/post/${postId}/comment/${commentId}`,
    UPDATE_COMMENT_API_URL: (postId, commentId) => `/post/${postId}/comment/${commentId}`,
}
Object.freeze(apiPath); // ENUM;