import { apiPath } from "~/features/shared/lib/path/apiPath"
import "../../styles/post-list/post-card.css"

type PostCardProps = {
    id: number;
    title: string;
    like: number;
    commentCount: number;
    hit: number;
    createdAt: string;
    authorImage?: string | null;
    authorNickname: string;
    onClick?: (postId: number) => void;
}
export function PostCard({
    id,
    title,
    like,
    commentCount,
    hit,
    createdAt,
    authorImage,
    authorNickname,
    onClick,
}: PostCardProps) {
    return (
        <div id={`post-card-${id}`} className="post-card-container">
            <div className="post-card-wrapper">
                <button
                    className="post-card-detail-btn"
                    onClick={() => onClick?.(id)}
                >
                    <div className="post-card-summary-field">
                        <h2 className="post-card-summary-title">{title}</h2>
                        <div className="post-card-summary-info">
                            <label className="post-card-summary-like">좋아요 {like}</label>
                            <label className="post-card-summary-comment">댓글 {commentCount}</label>
                            <label className="post-card-summary-viewcount">조회 수 {hit}</label>
                            <label className="post-card-summary-createdat">{createdAt}</label>
                        </div>
                    </div>
                    <div className="post-card-author-field">
                        <div className="post-card-author-profile">
                            {authorImage ?
                                (<img src={apiPath.PROFILE_IMAGE_STORATE_URL + authorImage} alt="작성자 프로필"></img>)
                                :
                                (<img alt="기본 프로필"></img>)
                            }
                        </div>
                        <div className="post-card-author-nickname">{authorNickname}</div>
                    </div>
                </button>
            </div>
        </div>
    )
}