import { apiPath } from "~/features/shared/lib/path/apiPath";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { requestCommentDelete } from "~/features/shared/lib/api/post-api";
import { Modal } from "~/features/shared/components/modal/Modal";
import { useState } from "react";
import { toastService } from "~/features/shared/components/toast/toastService";
import { useToast } from "~/features/shared/hooks/toast/useToast";
import "../../styles/post/comment-card.css"

type CommentData = {
    id: number;
    authorId: number;
    authorNickname: string;
    authorProfileImage: string | null;
    updatedAt: string;
    content: string;
};

type CommentCardProps = {
    postId: number;
    comment: CommentData;
    onEditStart: (commentId: number, content: string) => void;
    onDeleted: (commentId: number) => void;
};

export function CommentCard({
    postId,
    comment,
    onEditStart,
    onDeleted,
}: CommentCardProps) {
    const {
        id,
        authorId,
        authorNickname,
        authorProfileImage,
        updatedAt,
        content,
    } = comment;
    const toast = useToast();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const currentUserNickname =
        typeof window !== "undefined"
            ? localStorage.getItem("nickname")
            : null;

    const isOwnComment = currentUserNickname === authorNickname;

    const handleEditClick = () => {
        onEditStart(id, content);
    };

    const handleDeleteClick = async () => {
        try {
            await requestCommentDelete(postId, id);
            onDeleted(id);
            setIsDeleteModalOpen(false);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.showToast({
                    title: error.message,
                    buttonTitle: "닫기",
                    onClick() {
                        toastService.clear();
                    },
                })
                console.error(error.message);
            } else {
                console.error("댓글 삭제 중 오류가 발생했습니다.", error);
            }
        }
    };

    return (
        <div className="comment-container" id={`comment-${id}`}>
            <div className="comment-wrapper">
                <div className={`comment-author-profile-field ${authorId}`}>
                    {authorProfileImage ? (
                        <img
                            id="comment-author-profile-image"
                            src={apiPath.PROFILE_IMAGE_STORATE_URL + authorProfileImage}
                            alt="작성자 프로필"
                        />
                    ) : (
                        <img
                            id="comment-author-profile-image"
                            alt="기본 프로필"
                        />
                    )}
                </div>

                <div className="comment-main">
                    <div className="comment-author-field">
                        <label className="comment-author-nickname">
                            {authorNickname}
                        </label>
                        <label className="comment-updatedat">{updatedAt}</label>
                    </div>
                    <div className="comment-content-field">
                        <p className="comment-content">{content}</p>
                    </div>
                </div>

                <div className="comment-control-field">
                    {isOwnComment && (
                        <>
                            <button
                                id="comment-update-btn"
                                className="comment-control-btn"
                                onClick={handleEditClick}
                            >
                                수정
                            </button>
                            <button
                                id="comment-delete-btn"
                                className="comment-control-btn"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                삭제
                            </button>
                        </>
                    )}
                </div>
            </div>
            {isDeleteModalOpen && (
                <Modal
                    title="댓글을 삭제하시겠습니까?"
                    detail="삭제한 댓글은 복구할 수 없습니다."
                    onCancel={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteClick}
                >
                </Modal>
            )}
        </div>

    );
}
