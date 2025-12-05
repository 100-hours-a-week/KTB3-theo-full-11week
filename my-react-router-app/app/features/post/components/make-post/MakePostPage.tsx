import { useNavigate } from "react-router-dom"
import "../../styles/make-post/make-post.css"
import { useState } from "react";
import { isBlank, isOverMaxLength } from "~/features/shared/lib/util/util";
import { useForm } from "react-hook-form";
import { requestMakePost } from "~/features/shared/lib/api/post-api";
import { toastService } from "~/features/shared/components/toast/toastService";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { LOCAL_STORAGE_KEY } from "~/features/shared/lib/util/localstorage";

type MakePostFormValue = {
    title: string;
    article: string;
    articleImage: FileList;
}

export function MakePostPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        watch,
        reset,
    } = useForm<MakePostFormValue>({
        mode: "onChange",
        defaultValues: {
            title: "",
            article: "",
        }
    })

    const articleImageFiles = watch("articleImage");
    const articleImageTitle =
        articleImageFiles && articleImageFiles.length > 0 ?
            articleImageFiles[0].name : "파일을 선택해주세요.";

    const helperText =
        errors.title?.message ||
        errors.article?.message ||
        error ||
        "";

    const onSubmit = async (data: MakePostFormValue) => {
        if (!isValid) {
            return;
        }

        try {
            setError("");

            const authorId = Number(localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID));
            if (!authorId) {
                setError("로그인이 필요합니다.");
                return;
            }

            const title = data.title.trim();
            const article = data.article.trim();
            const articleImage = data.articleImage?.[0];
            const category = "COMMUNITY";

            await requestMakePost(
                authorId,
                title,
                article,
                articleImage,
                category
            );

            toastService.show({
                title: "소중한 경험이 공유되었어요.",
                buttonTitle: "게시글 목록 화면으로 이동",
                onClick() {
                    navigate('/postlist');
                }
            })

            reset();
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message);
            } else {
                setError(
                    "게시글 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
                )
            }
        }
    }

    const isButtonActive = isValid && !isSubmitting;

    return (
        <div className="make-post-container">
            <div className="make-post-wrapper">
                <h2>소중한 경험을 공유해요</h2>

                <form
                    id="make-post-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className="make-post-field">
                        <label className="make-post-label" htmlFor="make-post-form-title">
                            제목*
                        </label>
                        <input
                            id="make-post-form-title"
                            className="make-post-input"
                            placeholder="제목을 입력해주세요.(최대 26글자)"
                            aria-invalid={!!errors.title || undefined}
                            {...register("title", {
                                required: "제목을 입력해주세요",
                                validate: {
                                    notBlank: (value) =>
                                        !isBlank(value.trim()) || "제목을 입력해주세요",
                                    maxLength: (value) =>
                                        !isOverMaxLength(value.trim(), 26) ||
                                        "제목은 최대 26자 입니다.",
                                },
                            })}
                        />
                    </div>

                    {/* 내용 */}
                    <div className="make-post-field">
                        <label
                            className="make-post-label"
                            htmlFor="make-post-form-article"
                        >
                            내용*
                        </label>
                        <textarea
                            id="make-post-form-article"
                            className="make-post-input"
                            placeholder="내용을 입력해주세요"
                            aria-invalid={!!errors.article || undefined}
                            {...register("article", {
                                required: "내용을 입력해주세요",
                                validate: {
                                    notBlank: (value) =>
                                        !isBlank(value.trim()) || "내용을 입력해주세요",
                                },
                            })}
                        />
                        <p id="make-post-form-helper-text">{helperText}</p>
                    </div>

                    {/* 이미지 */}
                    <div className="make-post-field">
                        <label
                            className="make-post-label"
                            htmlFor="make-post-form-article-image"
                        >
                            이미지
                        </label>
                        <div className="make-post-form-file-row">
                            <input
                                id="make-post-form-article-image"
                                type="file"
                                accept="image/*"
                                className="make-post-input"
                                {...register("articleImage")}
                            />
                            <label
                                className="make-post-file-btn"
                                htmlFor="make-post-form-article-image"
                            >
                                파일 선택
                            </label>
                            <span className="make-post-file-text">{articleImageTitle}</span>
                        </div>
                    </div>

                    {/* 완료 버튼 */}
                    <button
                        id="make-post-btn"
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