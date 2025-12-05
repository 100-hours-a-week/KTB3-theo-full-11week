// app/features/post/components/edit-post/EditPostForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { isBlank, isOverMaxLength } from "~/features/shared/lib/util/util";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { requestEditPost } from "~/features/shared/lib/api/post-api";
import { toastService } from "~/features/shared/components/toast/toastService";
import "../../styles/edit-post/edit-post.css"

type EditPostFormValues = {
    title: string;
    article: string;
    articleImage: FileList;
};

type EditPostFormProps = {
    id: number;
    title: string;
    article: string;
    articleImage?: string | null;
    category: string;
};

export function EditPost({
    id,
    title,
    article,
    articleImage,
    category,
}: EditPostFormProps) {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid, isSubmitting },
        reset,
    } = useForm<EditPostFormValues>({
        mode: "onChange",
        defaultValues: {
            title,
            article,
        },
    });

    const articleImageFiles = watch("articleImage");
    const articleImageTitle =
        articleImageFiles && articleImageFiles.length > 0
            ? articleImageFiles[0].name
            : articleImage || "파일을 선택해주세요.";

    const helperText =
        errors.title?.message ||
        errors.article?.message ||
        serverError ||
        "";

    const onSubmit = async (data: EditPostFormValues) => {
        if (!isValid) return;

        try {
            setServerError("");

            const newTitle = data.title.trim();
            const newArticle = data.article.trim();
            const newFile = data.articleImage?.[0] ?? new Blob();
            const oldFileName = articleImage ?? "";

            await requestEditPost(
                id,
                newTitle,
                newArticle,
                oldFileName,
                newFile,
                category
            );

            toastService.show({
                title: "수정 완료",
                buttonTitle: "게시글 목록으로 이동",
                onClick() {
                    navigate("/postlist");
                },
            });

            reset({
                title: newTitle,
                article: newArticle,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                setServerError(error.message);
            } else {
                setServerError(
                    "게시글 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
                );
            }
        }
    };

    const isButtonActive = isValid && !isSubmitting;

    return (
        <div className="edit-post-container">
            <div className="edit-post-wrapper">
                <h2>게시글 수정</h2>
                <form id="edit-post-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="edit-post-field">
                        <label className="edit-post-label" htmlFor="edit-post-form-title">
                            제목*
                        </label>
                        <input
                            id="edit-post-form-title"
                            className="edit-post-input"
                            placeholder="제목을 입력해주세요.(최대 26글자)"
                            aria-invalid={!!errors.title || undefined}
                            {...register("title", {
                                required: "제목을 입력해주세요.",
                                validate: {
                                    notBlank: (value) =>
                                        !isBlank(value.trim()) || "제목을 입력해주세요.",
                                    maxLength: (value) =>
                                        !isOverMaxLength(value.trim(), 26) ||
                                        "제목은 최대 26자 입니다.",
                                },
                            })}
                        />
                    </div>
                    <div className="edit-post-field">
                        <label
                            className="edit-post-label"
                            htmlFor="edit-post-form-article"
                        >
                            내용*
                        </label>
                        <textarea
                            id="edit-post-form-article"
                            className="edit-post-input"
                            placeholder="내용을 입력해주세요"
                            aria-invalid={!!errors.article || undefined}
                            {...register("article", {
                                required: "내용을 입력해주세요.",
                                validate: {
                                    notBlank: (value) =>
                                        !isBlank(value.trim()) || "내용을 입력해주세요.",
                                },
                            })}
                        />
                        <p id="edit-post-form-helper-text">{helperText}</p>
                    </div>

                    <div className="edit-post-field">
                        <label
                            className="edit-post-label"
                            htmlFor="edit-post-form-article-image"
                        >
                            이미지
                        </label>
                        <div className="edit-post-form-file-row">
                            <input
                                id="edit-post-form-article-image"
                                type="file"
                                accept="image/*"
                                className="edit-post-input"
                                {...register("articleImage")}
                            />
                            <label
                                className="edit-post-file-btn"
                                htmlFor="edit-post-form-article-image"
                            >
                                파일 선택
                            </label>
                            <span className="edit-post-file-text">{articleImageTitle}</span>
                        </div>
                    </div>

                    {/* 완료 버튼 */}
                    <button
                        id="edit-post-btn"
                        type="submit"
                        disabled={!isButtonActive}
                        className={isButtonActive ? "active" : ""}
                    >
                        완료
                    </button>
                </form>
            </div>
        </div>
    );
}
