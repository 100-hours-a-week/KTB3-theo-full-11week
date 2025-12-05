import { Api } from "./api.js";
import { apiPath } from "../path/apiPath";

// 게시글 목록 조회 API 요청
// start, default Page = 0
export async function requestPostCardList(page: number, size: number) {
    const response = await new Api()
        .get()
        .url(apiPath.POST_CARD_LIST_API_URL)
        .queryString({ page, size })
        .request();

    return response;
}

// 게시글 삭제 요청 API
export async function requestPostDelete(postId: number) {
    const response = await new Api()
        .delete()
        .url(apiPath.DELETE_POST_API_URL(postId))
        .request();

    return response;
}

// post 좋아요 활성화 요청 API
export async function requestPostLike(postId: number, userId: number) {
    const response = await new Api()
        .post()
        .url(apiPath.POST_LIKE_API_URL(postId))
        .body({ userId })
        .request();

    return response;
}
// post 좋아요 비활성화 요청 API
export async function requestPostLikeCancel(postId: number, userId: number) {
    const response = await new Api()
        .post()
        .url(apiPath.POST_LIKE_CANCEL_API_URL(postId))
        .body({ userId })
        .request();

    return response;
}

// 현재 post 조회 요청 API
export async function requestPostDetail(postId: number) {
    const response = await new Api()
        .get()
        .url(apiPath.POST_DETAIL_API_URL(postId))
        .request();

    return response;
}

// 댓글 삭제 API 요청
export async function requestCommentDelete(postId: number, commentId: number) {
    const response = await new Api()
        .delete()
        .url(apiPath.DELETE_COMMENT_API_URL(postId, commentId))
        .request();
    return response;
}

// 댓글 생성 API 요청
export async function requestCreateComment(postId: number, userId: number, content: string) {
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
export async function requestFindComments(postId: number, page: number, size: number) {
    const response = await new Api()
        .get()
        .url(apiPath.FIND_COMMENTS_API_URL(postId))
        .queryString({ page, size })
        .request();

    return response;
}


// 댓글 수정 API 요청
export async function requestUpdateComment(postId: number, commentId: number, content: string) {
    const response = await new Api()
        .patch()
        .url(apiPath.UPDATE_COMMENT_API_URL(postId, commentId))
        .body({ content })
        .request();

    return response;
}

// 게시글 생성 요청
export async function requestMakePost(authorId: number, title: string, article: string, articleImage: File, category: string) {
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
export async function requestEditPost(postId: number, title: string, article: string, oldFileName: string, articleImage: File | null, category: string) {
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
        .print()
        .request();

    return response;
}

// 게시글 조회 수 증가 요청
export async function requestIncreasePostViewCount(postId: number) {
    const response = await new Api()
        .post()
        .url(apiPath.INCREASE_POST_VIEW_COUNT_API_URL(postId))
        .body({})
        .print()
        .request();

    return response;
}