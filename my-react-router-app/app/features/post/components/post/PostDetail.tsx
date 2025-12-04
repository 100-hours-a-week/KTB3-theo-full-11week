import { useCallback, useEffect, useState } from "react";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { requestIncreasePostViewCount, requestPostDelete, requestPostDetail, requestPostLike, requestPostLikeCancel } from "~/features/shared/lib/api/post-api";
import { apiPath } from "~/features/shared/lib/path/apiPath";
import "../../styles/post/post-detail.css"

const VIEW_COOLTIME_MS = 10_00 * 60;
const VIEW_COOLTIME_KEY = "postViewCoolTime";

type PostSummry = {
    postId: number;
    onBack: (handleBackToList: void) => void;
    onDelete: (handleDeletePost: void) => void;
}

type PostDetailData = {
    id: number;
    title: string;
    authorNickname: string;
    article: string;
    articleImage?: string | null;
    authorImage?: string | null;
    commentCount: number;
    createdAt: string;
    hit: number;
    like: number;
    category: string;
};

type PostDetailProps = {
    postId: number;
    onBack: (summary: {
        postId: number;
        commentCount: number;
        viewCount: number;
        likeCount: number;
    }) => void;
    onDelete: (postId: number) => void;
};

export function PostDetail({
    postId,
    onBack,
    onDelete
}: PostDetailProps) {
    const [post, setPost] = useState<PostDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isLikedPost, setIsLikedPost] = useState(false);
    const [wasLikedInitially, setWasLikedInitially] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);

    const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadDetail = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await requestPostDetail(postId);
                const detail: PostDetailData = response.data;

                if (!isMounted) {
                    return
                }

                setPost(detail);
                setLikeCount(detail.like);
                setViewCount(detail.hit);
                setCommentCount(detail.commentCount);

                const nickname = localStorage.getItem('nickname');
                setCurrentUserNickname(nickname);

                const likedpostIds = localStorage.getItem('likedPostId')?.split(',') ?? [];
                const liked = likedpostIds.includes(String(postId));

                setIsLikedPost(liked);
                setWasLikedInitially(liked);
            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                } else {
                    setError("게시글을 불러오는 중 오류가 발생했습니다.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadDetail();

        return () => {
            isMounted = false;
        }
    }, [postId]);

    useEffect(() => {
        if (!post) {
            return
        }

        const postIdStr = String(postId);
        const now = Date.now();

        const getViewCoolTimeMapFromStroage = () => {
            try {
                const raw = localStorage.getItem(VIEW_COOLTIME_KEY);
                if (!raw) {
                    return {};
                }
                const parsed = JSON.parse(raw);
                return typeof parsed === "object" && parsed !== null ? parsed : {};
            } catch {
                return {};
            }
        }

        const saveViewCoolTimeMapToStorage = (map: Record<string, number>) => {
            try {
                localStorage.setItem(VIEW_COOLTIME_KEY, JSON.stringify(map))
            } catch (error) {
            }
        }

        const coolTimeMap = getViewCoolTimeMapFromStroage();
        const lastViewdAt = coolTimeMap[postIdStr];

        if (typeof lastViewdAt === "number") {
            const diff = now - lastViewdAt;
            if (diff < VIEW_COOLTIME_MS) {
                return;
            }
        }

        const increaseViewCount = async () => {
            try {
                await requestIncreasePostViewCount(postId);
                setViewCount((prev) => prev + 1);

                const newMap = {
                    ...coolTimeMap,
                    [postIdStr]: now,
                };
                saveViewCoolTimeMapToStorage(newMap);
            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                } else {
                }
            }
        }
        increaseViewCount();
    }, [postId, post]);

    const syncLikeChangeToServer = useCallback(async () => {
        const userId = Number(localStorage.getItem('currentUserId'));
        if (!userId) {
            return
        };

        const postIdStr = String(postId);
        const likedPostIds = localStorage.getItem("likedPostId")?.split(",").filter(Boolean) ?? [];

        if (!wasLikedInitially && isLikedPost) {
            await requestPostLike(postId, userId);
            if (!likedPostIds.includes(postIdStr)) {
                likedPostIds.push(postIdStr);
            }
            localStorage.setItem("likedPostId", likedPostIds.join(","));
            return;
        }

        if (wasLikedInitially && !isLikedPost) {
            await requestPostLikeCancel(postId, userId);
            const filtered = likedPostIds.filter((id) => id !== postIdStr);
            localStorage.setItem("likedPostId", filtered.join(","));
        }
    }, [postId, isLikedPost, wasLikedInitially])

    const handleToggleLike = () => {
        setIsLikedPost((prev) => !prev);
        setLikeCount((prev) => (isLikedPost ? prev - 1 : prev + 1));
    }

    const handleBackToClick = async () => {
        try {
            await syncLikeChangeToServer();
        } finally {
            onBack({
                postId,
                commentCount,
                viewCount,
                likeCount,
            })
        }
    }

    const handleIncreaseCommentCount = () => {
        setCommentCount((prev) => prev + 1);
    }

    const handelDecreaseCommentCount = () => {
        setCommentCount((prev) => Math.max(0, prev - 1));
    }

    const handleDeletePost = async () => {
        // 모달 띄우기

        try {
            await requestPostDelete(postId);
            onDelete(postId);
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message);
            } else {
                setError("게시글 삭제 중 오류가 발생했습니다.")
            }
        }
    }

    const handleEditPost = () => {

    }

    if (isLoading) {
        return <div className="post-container">로딩 중...</div>
    }

    if (error || !post) {
        return <div className="post-container">오류 : {error ?? "게시글이 없습니다"}</div>
    }

    const {
        id,
        title,
        authorNickname,
        article,
        articleImage,
        authorImage,
        createdAt,
    } = post;

    const isOwnPost = currentUserNickname === authorNickname;

    return (
        <div id={`post-container-${id}`} className="post-container">
            <div className="post-wrapper">
                <div className="post-header-container">
                    <div className="post-header-top">
                        <h2>{title}</h2>
                        <button id="post-back-btn" onClick={handleBackToClick}>
                            목록으로
                        </button>
                    </div>

                    <div className="post-header-meta">
                        <div className="post-author-field">
                            <div className="post-author-profile">
                                {authorImage ? (
                                    <img
                                        id="post-author-profile-image"
                                        src={apiPath.PROFILE_IMAGE_STORATE_URL + authorImage}
                                        alt="작성자 프로필"
                                    />
                                ) : (
                                    <img
                                        id="post-author-profile-image"
                                        alt="기본 프로필"
                                    />
                                )}
                            </div>
                            <label className="post-author-nickname-field">
                                {authorNickname}
                            </label>
                            <p className="post-createdat">{createdAt}</p>
                        </div>

                        <div className="post-control-field">
                            {isOwnPost && (
                                <>
                                    <button
                                        id="post-update-btn"
                                        className="post-control-btn"
                                        onClick={handleEditPost}
                                    >
                                        수정
                                    </button>
                                    <button
                                        id="post-delete-btn"
                                        className="post-control-btn"
                                        onClick={handleDeletePost}
                                    >
                                        삭제
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="post-article-container">
                    <div className="post-article-image-box">
                        {articleImage ? (
                            <img
                                id="post-article-image"
                                src={apiPath.ARTICLE_IMAGE_STORAGE_URL + articleImage}
                                alt="게시글 이미지"
                            />
                        ) : (
                            <img id="post-article-image" alt="게시글 이미지 없음" />
                        )}
                    </div>

                    <p id="post-article-text">{article}</p>

                    <div className="post-article-status">
                        <div
                            className={
                                "post-article-like-box" +
                                (isLikedPost ? " like" : "")
                            }
                            onClick={handleToggleLike}
                        >
                            <label id="post-article-like">{likeCount}</label>
                            <label>좋아요 수</label>
                        </div>

                        <div className="post-article-viewcount-box">
                            <label id="post-article-viewcount">{viewCount}</label>
                            <label>조회 수</label>
                        </div>

                        <div className="post-article-comment-box">
                            <label id="post-article-comment-count">
                                {commentCount}
                            </label>
                            <label>댓글</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 댓글 리스트 */}
            {/* <CommentCardList
        postId={id}
        onCreate={handleIncreaseCommentCount}
        onDelete={handleDecreaseCommentCount}
      /> */}
        </div>
    );
}