import { use, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { isBetweenLength, isBlank, isEmail, isValidPasswordPattern } from "~/features/shared/lib/util/util";


type LoginFormValues = {
    email: string,
    password: string
}
export function LoginPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const { register, handleSubmit,
        formState: { errors, isValid, isSubmitting },
        getValues, } = useForm<LoginFormValues>({
            mode: "onChange",
            defaultValues: {
                email: "",
                password: "",
            },
        });

    const onSubmit = async () => {
        if (!isValid) return;

        setServerError("");

        try {


        } catch (error) {
            if (error instanceof ApiError) {
                setServerError(error.message);
            } else {
                setServerError(
                    "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                )
            }
        }
    }

    const helperText = errors.email?.message || errors.password?.message || serverError || "";

    const isButtonActive = isValid && !isSubmitting;

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <h2>로그인</h2>
                <div>
                    <form
                        id="login-form"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <div className="login-field">
                            <label className="login-label" htmlFor="login-form-email">
                                이메일
                            </label>
                            <input
                                id="login-form-email"
                                type="email"
                                className="login-input"
                                placeholder="이메일을 입력하세요"
                                aria-invalid={!!errors.email || undefined}
                                {...register("email", {
                                    required: "이메일을 입력해주세요",
                                    validate: {
                                        format: (value) => isEmail(value.trim()) || "올바른 이메일 주소 형식을 입력해주세요. example@example.com",
                                    },
                                })}
                            />
                        </div>

                        <div className="login-field">
                            <label className="login-label" htmlFor="login-form-password">
                                비밀번호
                            </label>
                            <input
                                id="login-form-password"
                                type="password"
                                className="login-input"
                                placeholder="비밀번호를 입력하세요"
                                aria-invalid={!!errors.password || undefined}
                                {...register("password", {
                                    required: "비밀번호를 입력해주세요",
                                    validate: {
                                        pattern: (value) => isValidPasswordPattern(value.trim()) || "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.",
                                        length: (value) => isBetweenLength(value.trim(), 8, 20) || "비밀번호는 8자 이상, 20자 이하입니다.",
                                    },
                                })}
                            />
                        </div>
                        <p id="login-form-helper-text">{helperText}</p>
                        <button
                            id="login-btn"
                            type="submit"
                            disabled={!isButtonActive}
                            className={isButtonActive ? "active" : ""}
                        >
                            {isSubmitting ? "로그인 중..." : "로그인"}
                        </button>
                    </form>
                    <a
                        id="login-to-signup-link"
                        href="/signup"
                        className="router-link"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/signup");
                        }}
                    >
                        회원가입
                    </a>
                </div>
            </div>
        </div>
    );
}