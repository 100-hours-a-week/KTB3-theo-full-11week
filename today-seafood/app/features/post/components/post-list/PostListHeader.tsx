import { useNavigate } from "react-router-dom";
import "../../styles/post-list/post-list-header.css"

export function PostListHeader() {
    const navigate = useNavigate();

    return (
        <div className="post-card-list-header">
            <div className="post-card-title-box">
                <p>오늘의 수산에서,<br />오늘의 <strong>시세</strong>와<strong>이야기</strong>를 나눠보세요</p>
                <button
                    className="post-card-create-btn"
                    onClick={() => navigate('/makepost')}
                >경험 나누기</button>
            </div>
        </div>
    );
}