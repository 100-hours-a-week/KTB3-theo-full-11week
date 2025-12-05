// app/features/post/components/post/PostDetailPage.tsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "~/features/shared/lib/api/apiError";
import {
    requestIncreasePostViewCount,
    requestPostDelete,
    requestPostDetail,
    requestPostLike,
    requestPostLikeCancel,
} from "~/features/shared/lib/api/post-api";
import { apiPath } from "~/features/shared/lib/path/apiPath";
import { CommentCardList } from "./CommentCardList";
import "../../styles/post/post-detail.css"
import { Modal } from "~/features/shared/components/modal/Modal";
import { toastService, useToast } from "~/features/shared/components/toast/useToast";

const VIEW_COOLTIME_MS = 10_00 * 60;
const VIEW_COOLTIME_KEY = "postViewCoolTime";

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

export function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const numericPostId = Number(postId);
    const [post, setPost] = useState<PostDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isLikedPost, setIsLikedPost] = useState(false);
    const [wasLikedInitially, setWasLikedInitially] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);

    const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(
        null
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // 상세 조회
    useEffect(() => {
        if (!numericPostId) return;

        let isMounted = true;

        const loadDetail = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await requestPostDetail(numericPostId);
                const detail: PostDetailData = response.data;

                if (!isMounted) return;

                setPost(detail);
                setLikeCount(detail.like);
                setViewCount(detail.hit);
                setCommentCount(detail.commentCount);

                const nickname = localStorage.getItem("nickname");
                setCurrentUserNickname(nickname);

                const likedPostIds =
                    localStorage.getItem("likedPostId")?.split(",") ?? [];
                const liked = likedPostIds.includes(String(numericPostId));

                setIsLikedPost(liked);
                setWasLikedInitially(liked);
            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                } else {
                    setError("게시글을 불러오는 중 오류가 발생했습니다.");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadDetail();

        return () => {
            isMounted = false;
        };
    }, [numericPostId]);

    // 조회수 증가 (쿨타임)
    useEffect(() => {
        if (!post || !numericPostId) return;

        const postIdStr = String(numericPostId);
        const now = Date.now();

        const getViewCoolTimeMapFromStorage = () => {
            try {
                const raw = localStorage.getItem(VIEW_COOLTIME_KEY);
                if (!raw) return {};
                const parsed = JSON.parse(raw);
                return typeof parsed === "object" && parsed !== null ? parsed : {};
            } catch {
                return {};
            }
        };

        const saveViewCoolTimeMapToStorage = (map: Record<string, number>) => {
            try {
                localStorage.setItem(VIEW_COOLTIME_KEY, JSON.stringify(map));
            } catch { }
        };

        const coolTimeMap = getViewCoolTimeMapFromStorage();
        const lastViewedAt = coolTimeMap[postIdStr];

        if (typeof lastViewedAt === "number") {
            const diff = now - lastViewedAt;
            if (diff < VIEW_COOLTIME_MS) {
                return;
            }
        }

        const increaseViewCount = async () => {
            try {
                await requestIncreasePostViewCount(numericPostId);
                setViewCount((prev) => prev + 1);

                const newMap = {
                    ...coolTimeMap,
                    [postIdStr]: now,
                };
                saveViewCoolTimeMapToStorage(newMap);
            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                }
            }
        };

        increaseViewCount();
    }, [numericPostId, post]);

    // 좋아요 서버 동기화
    const syncLikeChangeToServer = useCallback(async () => {
        const userId = Number(localStorage.getItem("currentUserId"));
        if (!userId || !numericPostId) return;

        const postIdStr = String(numericPostId);
        const likedPostIds =
            localStorage.getItem("likedPostId")?.split(",").filter(Boolean) ?? [];

        if (!wasLikedInitially && isLikedPost) {
            await requestPostLike(numericPostId, userId);
            if (!likedPostIds.includes(postIdStr)) {
                likedPostIds.push(postIdStr);
            }
            localStorage.setItem("likedPostId", likedPostIds.join(","));
            return;
        }

        if (wasLikedInitially && !isLikedPost) {
            await requestPostLikeCancel(numericPostId, userId);
            const filtered = likedPostIds.filter((id) => id !== postIdStr);
            localStorage.setItem("likedPostId", filtered.join(","));
        }
    }, [numericPostId, isLikedPost, wasLikedInitially]);

    const handleToggleLike = () => {
        setIsLikedPost((prev) => !prev);
        setLikeCount((prev) => (isLikedPost ? prev - 1 : prev + 1));
    };

    const handleBackToList = async () => {
        try {
            await syncLikeChangeToServer();
        } finally {
            // 뒤로가기 없으면 /postlist로
            navigate('/postlist')
        }
    };

    const handleIncreaseCommentCount = () => {
        setCommentCount((prev) => prev + 1);
    };

    const handleDecreaseCommentCount = () => {
        setCommentCount((prev) => Math.max(0, prev - 1));
    };

    const handleEditPost = () => {
        navigate(`/post/${numericPostId}/edit`);
    };

    if (isLoading) {
        return <div className="post-container">로딩 중...</div>;
    }

    if (error || !post) {
        return <div className="post-container">오류 : {error ?? "게시글이 없습니다"}</div>;
    }

    const handleDeleteClick = async () => {
        try {
            await requestPostDelete(Number(postId));
            setIsDeleteModalOpen(false);
            toast.showToast({
                title: "게시글 목록 화면으로 돌아갑니다",
                buttonTitle: "닫기",
                onClick() {
                    toastService.clear();
                    navigate("/postlist");
                },
            })
        } catch (error) {
            if (error instanceof ApiError) {
                toast.showToast({
                    title: error.message,
                    buttonTitle: "게시글 목록 화면으로 이동",
                    onClick() {
                        toastService.clear();
                        navigate('/postlist')
                    },
                })
            }
        }
    };

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
                        <button id="post-back-btn" onClick={handleBackToList}>
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
                                    <img id="post-author-profile-image" alt="기본 프로필" />
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
                                        onClick={() => setIsDeleteModalOpen(true)}
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
                                "post-article-like-box" + (isLikedPost ? " like" : "")
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
            {isDeleteModalOpen && (
                <Modal
                    title="게시글을 삭제하시겠습니까?"
                    detail="삭제한 게시글은 복구할 수 없습니다."
                    onCancel={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteClick}
                >
                </Modal>
            )}
            <CommentCardList
                postId={id}
                onCreate={handleIncreaseCommentCount}
                onDelete={handleDecreaseCommentCount}
            />
        </div>
    );
}
