import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "~/features/shared/lib/api/apiError";
import {
    requestEditPost,
    requestPostDetail,
} from "~/features/shared/lib/api/post-api";
import "../../styles/edit-post/edit-post.css"

type PostDetailData = {
    id: number;
    title: string;
    article: string;
    articleImage?: string | null;
    category: string;
};

export function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const numericPostId = Number(postId);

    const [post, setPost] = useState<PostDetailData | null>(null);
    const [title, setTitle] = useState("");
    const [article, setArticle] = useState("");
    const [oldImageName, setOldImageName] = useState<string | null>(null);
    const [newFile, setNewFile] = useState<File | null>();
    const [helperText, setHelperText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!numericPostId) return;

        let isMounted = true;

        const load = async () => {
            try {
                const response = await requestPostDetail(numericPostId);
                const data = response.data as PostDetailData;
                if (!isMounted) return;

                setPost(data);
                setTitle(data.title);
                setArticle(data.article);
                setOldImageName(data.articleImage ?? null);
            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                } else {
                    setError("게시글 정보를 불러오는 중 오류가 발생했습니다.");
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [numericPostId]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!post) return;

        const trimmedTitle = title.trim();
        const trimmedArticle = article.trim();

        if (!trimmedTitle || !trimmedArticle) {
            setHelperText("제목, 내용을 모두 작성해주세요.");
            return;
        }

        if (trimmedTitle.length > 26) {
            setHelperText("제목은 최대 26자 입니다.");
            return;
        }

        setHelperText("");
        setIsSubmitting(true);
        setError(null);

        try {
            const fileToSend: File = newFile ?? new File([], "", { type: "application/octet-stream" });

            await requestEditPost(
                post.id,
                trimmedTitle,
                trimmedArticle,
                oldImageName ?? "",
                fileToSend,
                post.category
            );

            navigate(`/post/${post.id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message);
            } else {
                setError("게시글 수정 중 오류가 발생했습니다.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!post) {
        return <div className="edit-post-container">로딩 중...</div>;
    }

    return (
        <div className="edit-post-container">
            <div className="edit-post-wrapper">
                <h2>게시글 수정</h2>
                <form id="edit-post-form" onSubmit={handleSubmit}>
                    <div className="edit-post-field">
                        <label className="edit-post-label">제목*</label>
                        <input
                            id="edit-post-form-title"
                            className="edit-post-input"
                            placeholder="제목을 입력해주세요.(최대 26글자)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="edit-post-field">
                        <label className="edit-post-label">내용*</label>
                        <textarea
                            id="edit-post-form-article"
                            className="edit-post-input"
                            placeholder="내용을 입력해주세요"
                            value={article}
                            onChange={(e) => setArticle(e.target.value)}
                        />
                        <p id="edit-post-form-helper-text">
                            {helperText || error}
                        </p>
                    </div>

                    <div className="edit-post-field">
                        <label className="edit-post-label">이미지</label>
                        <div className="edit-post-form-file-row">
                            <input
                                id="edit-post-form-article-image"
                                type="file"
                                accept="image/*"
                                className="edit-post-input"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setNewFile(file);
                                }}
                            />
                            <label
                                className="edit-post-file-btn"
                                htmlFor="edit-post-form-article-image"
                            >
                                파일 선택
                            </label>
                            <span className="edit-post-file-text">
                                {newFile?.name || oldImageName || "파일을 선택해주세요."}
                            </span>
                        </div>
                    </div>

                    <button
                        id="edit-post-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className={
                            !isSubmitting && title.trim() && article.trim()
                                ? "active"
                                : ""
                        }
                    >
                        수정 완료
                    </button>
                </form>
            </div>
        </div>
    );
}
