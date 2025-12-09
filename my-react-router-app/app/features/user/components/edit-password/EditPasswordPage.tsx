import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useLogout } from "~/features/shared/hooks/logout/useLogout";
import { toastService, useToast } from "~/features/shared/hooks/toast/useToast";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { requestEditPassword } from "~/features/shared/lib/api/user-api";
import { LOCAL_STORAGE_KEY } from "~/features/shared/lib/util/localstorage";
import { isBetweenLength, isBlank, isValidPasswordPattern } from "~/features/shared/lib/util/util";
import "../../styles/edit-password/edit-password.css"

type EditPasswordFormValues = {
    password: string,
    passwordConfirm: string;
}

export function EditPaswordPage() {
    const navigate = useNavigate();
    const { showToast, hideToast } = useToast();
    const { logoutWithNoRedirect } = useLogout();

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isValid, isSubmitting },
    } = useForm<EditPasswordFormValues>({
        mode: "onChange"
    })

    const passwordValue = watch('password');
    const passwordConfirmValue = watch('passwordConfirm');

    const onSubmit = async (data: EditPasswordFormValues) => {
        const userId = Number(localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID));

        if (!userId) {
            showToast({
                title: "유저 정보를 찾을 수 없습니다.",
                buttonTitle: "닫기",
                onClick() {
                    toastService.clear();
                }
            })
            return;
        }

        try {
            await requestEditPassword(userId, data.password.trim());

            logoutWithNoRedirect();

            showToast({
                title: "비밀번호가 수정되었습니다.",
                buttonTitle: "로그인 화면 이동",
                onClick() {
                    hideToast();
                    navigate("/login", { replace: true })
                }
            })

        } catch (error) {
            if (error instanceof ApiError) {
                showToast({
                    title: error.message,
                    buttonTitle: "닫기",
                    onClick() {
                        hideToast();
                        navigate("/login", { replace: true });
                    }
                })
            }
        }
    }

    const handlePasswordBlur = async () => {
        if (passwordConfirmValue) {
            await trigger('passwordConfirm');
        }
    }

    return (
        <div className="edit-password-container">
            <div className="edit-password-wrapper">
                <h2>비밀번호 수정</h2>
                <form
                    id="edit-password-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className="edit-password-field">
                        <label
                            className="edit-password-label"
                            htmlFor="edit-password-form-password"
                        >
                            변경할 비밀번호
                        </label>
                        <input
                            id="edit-password-form-password"
                            type="password"
                            className="edit-password-input"
                            placeholder="비밀번호를 입력하세요"
                            aria-invalid={!!errors.password || undefined}
                            {...register("password", {
                                required: "비밀번호를 입력해주세요",
                                validate: {
                                    blank: (value) =>
                                        !isBlank(value.trim()) ||
                                        "비밀번호를 입력해주세요",
                                    format: (value) =>
                                        (isValidPasswordPattern(value.trim()) &&
                                            isBetweenLength(
                                                value.trim(),
                                                8,
                                                20
                                            )) ||
                                        "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.",
                                    matchConfirm: (value) =>
                                        !passwordConfirmValue ||
                                        value.trim() ===
                                        passwordConfirmValue.trim() ||
                                        "비밀번호 확인과 다릅니다.",
                                },
                            })}
                            onBlur={handlePasswordBlur}
                        />
                    </div>
                    <p className="edit-password-form-helper-text helper-password">
                        {errors.password?.message}
                    </p>
                    <div className="edit-password-field">
                        <label
                            className="edit-password-label"
                            htmlFor="edit-password-form-password-confirm"
                        >
                            비밀번호 확인
                        </label>
                        <input
                            id="edit-password-form-password-confirm"
                            type="password"
                            className="edit-password-input"
                            placeholder="비밀번호를 한 번 더 입력하세요"
                            aria-invalid={!!errors.passwordConfirm || undefined}
                            {...register("passwordConfirm", {
                                required: "비밀번호를 한 번 더 입력해주세요.",
                                validate: {
                                    blank: (value) =>
                                        !isBlank(value.trim()) ||
                                        "비밀번호를 한 번 더 입력해주세요.",
                                    match: (value) =>
                                        value.trim() ===
                                        passwordValue?.trim() ||
                                        "비밀번호와 다릅니다.",
                                },
                            })}
                        />
                    </div>
                    <p className="edit-password-form-helper-text helper-password-confirm">
                        {errors.passwordConfirm?.message}
                    </p>
                    <button
                        id="edit-password-btn"
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className={isValid ? "active" : ""}
                    >
                        {isSubmitting ? "수정 중..." : "수정하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}