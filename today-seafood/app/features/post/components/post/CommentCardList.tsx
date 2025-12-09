import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import "../../styles/post/comment-card-list.css"
import { requestCreateComment, requestFindComments, requestUpdateComment } from "~/features/shared/lib/api/post-api";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { getNowData, isBlank } from "~/features/shared/lib/util/util";
import { CommentCard } from "./CommentCard";
import { LOCAL_STORAGE_KEY } from "~/features/shared/lib/util/localstorage";

type Comment = {
    id: number;
    authorId: number;
    authorNickname: string;
    authorProfileImage: string | null;
    updatedAt: string;
    content: string;
}

type CommentCardListProps = {
    postId: number;
    onCreate?: () => void;
    onDelete?: () => void;
}
export function CommentCardList({ postId, onCreate, onDelete }: CommentCardListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(0);
    const size = 10;

    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [content, setContent] = useState("");

    const [error, setError] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasNext) {
            return;
        }

        let isMounted = true;

        const loadPage = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await requestFindComments(postId, page, size);
                const { contents, hasNext: nextFlag } = response.data;

                if (!isMounted) {
                    return;
                }

                setComments((prev) => [...prev, ...contents]);
                setHasNext(nextFlag);

            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                } else {
                    setError("댓글을 불러오는 중 오류가 발생했습니다.")
                }
            }
            finally {
                if (isMounted) {
                    setIsLoading(false);
                }

            }
        }
        loadPage();

        return () => {
            isMounted = false;
        }
    }, [page, postId, hasNext])

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoading && hasNext) {
                setPage((prev) => prev + 1);
            }
        }, { threshold: 0.5 })

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [isLoading, hasNext]);

    const resetEditMode = () => {
        setIsEditMode(false);
        setEditingCommentId(null);
        setContent("");
    }

    const canSubmit = !isBlank(content);

    const handleCreateCommentRequest = useCallback(async () => {
        if (!canSubmit) {
            return;
        }

        try {
            const userIdStr = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID);
            const userId = userIdStr ? Number(userIdStr) : null;
            if (!userId) {
                return;
            }

            const commentTrimmed = content.trim();
            const response = await requestCreateComment(postId, userId, commentTrimmed);
            const responseBody = response.data;

            const newComment: Comment = {
                id: responseBody.id,
                authorId: userId,
                authorNickname: localStorage.getItem(LOCAL_STORAGE_KEY.NICKNAME) ?? '익명',
                authorProfileImage: localStorage.getItem(LOCAL_STORAGE_KEY.PROFILE_IMAGE) ?? null,
                updatedAt: getNowData(),
                content: responseBody.content,
            };

            setComments((prev) => [newComment, ...prev]);
            setContent('');

            onCreate?.();
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message);
            } else {
                setError("댓글을 작성하는 중 오류가 발생했습니다.");
            }
        }
    }, [canSubmit, content, onCreate, postId]);

    const handleUpdateCommentRequest = useCallback(async () => {
        if (!isEditMode || editingCommentId == null || !canSubmit) {
            return;
        }

        try {
            const commentTrimmed = content.trim();
            const response = await requestUpdateComment(postId, editingCommentId, commentTrimmed);
            const responseBody = response.data;

            setComments((prev) =>
                prev.map(
                    c => c.id == editingCommentId ? { ...c, content: responseBody.content, updatedAt: responseBody.updatedAt }
                        : c
                )
            );

            resetEditMode();
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message);
            } else {
                setError("댓글을 수정하는 중 오류가 발생했습니다.")
            }
        }
    }, [canSubmit, content, editingCommentId, isEditMode, postId]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!canSubmit) {
            return;
        }

        if (!isEditMode) {
            await handleCreateCommentRequest();
        } else {
            await handleUpdateCommentRequest();
        }
    }

    const handleDeleteComment = useCallback(
        (commentId: number) => {
            setComments(prev => prev.filter(c => c.id !== commentId));

            if (editingCommentId === commentId) {
                resetEditMode();
            }

            onDelete?.();
        },
        [editingCommentId, onDelete]
    )

    const handleStartEdit = useCallback((commentId: number, prevContent: string) => {
        setIsEditMode(true);
        setEditingCommentId(commentId);
        setContent(prevContent);
    }, [])
    return (
        <div className="comment-card-list-container">
            <div className="comment-card-list-wrapper">
                <form id="comment-form" onSubmit={handleSubmit}>
                    <div className="comment-field">
                        <textarea
                            id="comment-form-content"
                            placeholder="댓글을 남겨주세요!"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                        {!isEditMode ? (
                            <button
                                id="comment-form-create-btn"
                                type="submit"
                                className={canSubmit ? "active" : ""}
                                disabled={!canSubmit}
                            >
                                댓글 등록
                            </button>
                        ) : (
                            <button
                                id="comment-form-update-btn"
                                type="submit"
                                className={canSubmit ? "active" : ""}
                                disabled={!canSubmit}
                            >
                                댓글 수정
                            </button>
                        )}
                    </div>
                </form>

                {error && <p className="comment-error-text">{error}</p>}

                {comments.map(comment => (
                    <CommentCard
                        key={comment.id}
                        postId={postId}
                        comment={comment}
                        onDeleted={handleDeleteComment}
                        onEditStart={handleStartEdit}
                    />
                ))}
            </div>
            <div
                ref={sentinelRef}
                className="comment-card-list-sentinel"
                style={{ height: "24px" }}
            />
        </div>
    );
}