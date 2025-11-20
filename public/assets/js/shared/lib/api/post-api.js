import { Api } from "./api.js";
import { apiPath } from "../../path/apiPath.js";

// 게시글 목록 조회 API 요청
// start, default Page = 0
export async function requestPostCardList(page, size) {
    const response = await new Api()
        .get()
        .url(apiPath.POST_CARD_LIST_API_URL)
        .queryString({ page, size })
        .request();

    return response;
}

// 게시글 삭제 요청 API
export async function requestPostDelete(postId) {
    const response = await new Api()
        .delete()
        .url(apiPath.DELETE_POST_API_URL(postId))
        .request();

    return response;
}

// post 좋아요 활성화 요청 API
export async function requestPostLike(postId, userId) {
    const response = await new Api()
        .post()
        .url(apiPath.POST_LIKE_API_URL(postId))
        .body({ userId })
        .request();

    return response;
}
// post 좋아요 비활성화 요청 API
export async function requestPostLikeCancel(postId, userId) {
    const response = await new Api()
        .post()
        .url(apiPath.POST_LIKE_CANCEL_API_URL(postId))
        .body({ userId })
        .request();

    return response;
}

// 현재 post 조회 요청 API
export async function requestPostDetail(postId) {
    const response = await new Api()
        .get()
        .url(apiPath.POST_DETAIL_API_URL(postId))
        .request();

    return response;
}

// 댓글 삭제 API 요청
export async function requestCommentDelete(postId, commentId) {
    const response = await new Api()
        .delete()
        .url(apiPath.DELETE_COMMENT_API_URL(postId, commentId))
        .request();
    return response;
}

// 댓글 생성 API 요청
export async function requestCreateComment(postId, userId, content) {
    const response = await new Api()
        .post()
        .url(apiPath.CREATE_COMMENT_API_URL(postId))
        .body({
            userId: userId,
            content: content
        })
        .print()
        .request();

    return response;
}

// 게시글 댓글 조회 API 요청
// start, default Page = 0
export async function requestFindComments(postId, page, size) {
    const response = await new Api()
        .get()
        .url(apiPath.FIND_COMMENTS_API_URL(postId))
        .queryString({ page, size })
        .request();

    return response;
}


// 댓글 수정 API 요청
export async function requestUpdateComment(postId, commentId, content) {
    const response = await new Api()
        .patch()
        .url(apiPath.UPDATE_COMMENT_API_URL(postId, commentId))
        .body({ content })
        .request();

    return response;
}

// 게시글 생성 요청
export async function requestMakePost(authorId, title, article, articleImage, category) {
    let body = { authorId, title, article, articleImage, category }

    const response = await new Api()
        .post()
        .url(apiPath.MAKE_POST_API_URL)
        .body(body)
        .toFormData()
        .request();

    return response;
}

// 게시글 수정 요청 API
export async function requestEditPost(postId, title, article, oldFileName, articleImage, category) {
    const response = await new Api()
        .patch()
        .url(apiPath.EDIT_POST_API_URL(postId))
        .body({
            title,
            article,
            oldFileName,
            articleImage,
            category
        })
        .toFormData()
        .request();

    return response;
}

// 게시글 조회 수 증가 요청
export async function requestIncreasePostViewCount(postId) {
    const response = await new Api()
        .post()
        .url(apiPath.INCREASE_POST_VIEW_COUNT_API_URL(postId))
        .body({})
        .print()
        .request();

    return response;
}