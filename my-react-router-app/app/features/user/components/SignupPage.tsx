import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { isBetweenLength, isEmail, isFile, isOverMaxLength, isValidPasswordPattern } from '~/features/shared/lib/util/util';
import { ApiError } from '~/features/shared/lib/api/apiError';
import { requestEmailDuplication, requestNicknameDuplication, requestSignup } from '~/features/shared/lib/api/userApi';
import { toastService } from '~/features/shared/components/toast/toastService';

type SignupFormValues = {
    email: string,
    password: string,
    passwordConfirm: string,
    nickname: string,
    profileImage: FileList,
}

export function SignupPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const [isAvailableEmail, setIsAvailableEmail] = useState(false);
    const [isAvailableNickname, setIsAvailableNickname] = useState(false);
    const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        getValues,
        watch,
        setError,
        clearErrors,
        reset,
    } = useForm<SignupFormValues>({
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            passwordConfirm: "",
            nickname: "",
        }
    });

    const watchEmail = watch('email');
    const watchNickname = watch('nickname');
    const watchProfileImage = watch('profileImage');

    // 이메일이 바뀌면 중복체크 상태 초기화
    useEffect(() => {
        setIsAvailableEmail(false);
    }, [watchEmail])

    // 닉네임이 바뀌면 중복체크 상태 초기화
    useEffect(() => {
        setIsAvailableNickname(false);
    }, [watchNickname])

    // 프로필 이미지 미리보기 처리
    useEffect(() => {
        if (!watchProfileImage || watchProfileImage.length == 0) {
            if (profilePreviewUrl) {
                URL.revokeObjectURL(profilePreviewUrl);
            }
            setProfilePreviewUrl(null);
            return;
        }

        const file = watchProfileImage[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setProfilePreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        }

    }, [watchProfileImage])

    // 이메일 중복 검사
    const handleEmailDuplication = async () => {
        const email = watchEmail?.trim();
        if (!email || !isEmail(email)) return;

        try {
            const response = await requestEmailDuplication(email);
            const responseBody = response.data;
            const isAvailable = responseBody.available;

            if (!isAvailable) {
                setIsAvailableEmail(false);
                setError('email', {
                    type: 'duplication',
                    message: '중복된 이메일입니다.'
                })
            } else {
                setIsAvailableEmail(true);
                if (errors?.email?.type === 'duplication') {
                    clearErrors('email');
                }
            }
        } catch (error) {
            if (error instanceof ApiError) {
                setIsAvailableEmail(false);
            }
        }
    }

    const handleNicknameDuplicatioin = async () => {
        const nickname = watchNickname?.trim();
        if (!nickname || isOverMaxLength(nickname, 10)) {
            return;
        }
        try {
            const response = await requestNicknameDuplication(nickname);
            const responseBody = response.data;
            const isAvailable = responseBody.available;

            if (!isAvailable) {
                setIsAvailableNickname(false);
                setError('nickname', {
                    type: 'duplication',
                    message: '중복된 닉네임입니다.',
                });
            } else {
                setIsAvailableNickname(true);
                if (errors?.nickname?.type === 'duplication') {
                    clearErrors('nickname');
                }
            }
        } catch (error) {
            if (error instanceof ApiError) {
                setIsAvailableNickname(false);
            }
        }
    }

    const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
        if (!isValid || !isAvailableEmail || !isAvailableNickname) {
            return;
        }

        try {
            setServerError('');

            const email = data.email.trim();
            const password = data.password.trim();
            const nickname = data.nickname.trim();
            const profileImage = data.profileImage?.[0];

            const response = await requestSignup(email, password, nickname, profileImage);
            reset();
            toastService.show({
                title: "회원가입이 완료되었습니다.",
                buttonTitle: "로그인 페이지로 이동",
                onClick() {
                    navigate("/login");
                },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                setServerError(error.message);
            } else {
                setServerError(
                    "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                )
            }
        }
    }
    const isButtonActive =
        isValid && isAvailableEmail && isAvailableNickname && !isSubmitting;

    return (
        <div className='signup-form-container'>
            <div className="signup-form-wrapper">
                <h2>회원가입</h2>
                <form
                    id="signup-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className="signup-field signup-profile-field">
                        <label className="signup-label" htmlFor="signup-form-profile-image">프로필 사진</label>
                        <p className="signup-form-helper-text helper-profile-image">
                            {errors.profileImage?.message as string | undefined}
                        </p>
                        <input
                            id="signup-form-profile-image"
                            type="file"
                            accept="image/*"
                            {...register('profileImage', {
                                validate: {
                                    requiredFile: (fileList) => fileList && fileList.length > 0 ? true : '프로필 사진을 추가해주세요.',
                                    fileType: (fileList) => {
                                        const file = fileList?.[0];
                                        if (!file) return false;
                                        if (!isFile(file)) {
                                            return '이미지 파일만 업로드 가능합니다.'
                                        }
                                        return true;
                                    }
                                }
                            })}
                        />
                        <button
                            id="signup-image-upload-btn"
                            type="button"
                            onClick={() => {
                                document.getElementById('signup-form-profile-image')?.click();
                            }}>
                            {profilePreviewUrl ?
                                (<img
                                    id="sign-form-preview"
                                    src={profilePreviewUrl}
                                    alt='프로필 미리보기'
                                ></img>)
                                :
                                ('+')
                            }
                        </button>
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="signup-form-email">이메일*</label>
                        <input
                            id="signup-form-email"
                            type="email"
                            className="signup-input"
                            placeholder='이메일을 입력해주세요'
                            aria-invalid={!!errors.email || undefined}
                            {...register("email", {
                                required: "이메일을 입력해주세요",
                                validate: {
                                    format: (value) =>
                                        isEmail(value.trim()) ||
                                        "올바른 이메일 주소 형식을 입력해주세요. example@example.com"
                                }
                            })}
                            onBlur={() => {
                                // 유효성 검사 통과한 경우에만 중복검사 요청
                                if (!errors.email) {
                                    handleEmailDuplication();
                                }
                            }}
                        />
                        <p className="signup-form-helper-text helper-email">
                            {errors?.email?.message}
                        </p>
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="signup-form-password">비밀번호*</label>
                        <input
                            id="signup-form-password"
                            type="password"
                            className="signup-input"
                            placeholder="비밀번호를 입력해주세요"
                            aria-invalid={!!errors.password || undefined}
                            {...register("password", {
                                required: "비밀번호를 입력해주세요",
                                validate: {
                                    pattern: (value) =>
                                        isValidPasswordPattern(value.trim()) ||
                                        "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.",
                                    length: (value) =>
                                        isBetweenLength(value.trim(), 8, 20) ||
                                        "비밀번호는 8자 이상, 20자 이하입니다.",
                                },
                            })}
                        />
                        <p className="signup-form-helper-text helper-password">
                            {errors.password?.message}
                        </p>
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="signup-form-password-confirm">비밀번호 확인*</label>
                        <input
                            id="signup-form-password-confirm"
                            type="password"
                            className="signup-input"
                            placeholder="비밀번호를 한 번 더 입력하세요"
                            aria-invalid={!!errors.passwordConfirm || undefined}
                            {...register("passwordConfirm", {
                                required: "비밀번호를 한 번 더 입력해주세요",
                                validate: {
                                    samePassword: (value) => {
                                        const { password } = getValues();
                                        return value.trim() === password || "비밀번호가 다릅니다."
                                    }
                                }
                            })}
                        />
                        <p className="signup-form-helper-text helper-password-confirm">
                            {errors.passwordConfirm?.message}
                        </p>
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="signup-form-nickname">닉네임*</label>
                        <input
                            id="signup-form-nickname"
                            type="text"
                            className="signup-input"
                            placeholder="닉네임을 입력하세요"
                            aria-invalid={!!errors.nickname || undefined}
                            {...register('nickname', {
                                required: "닉네임을 입력해주세요",
                                validate: {
                                    length: (value) => !isOverMaxLength(value, 10) || "닉네임은 최대 10자까지 작성 가능합니다.",
                                    whiteSpace: (value) => !value.includes(' ') || "띄워쓰기를 없애주세요",
                                }
                            })}
                            onBlur={() => {
                                if (!errors.nickname) {
                                    handleNicknameDuplicatioin();
                                }
                            }}
                        />
                        <p className="signup-form-helper-text helper-nickname">
                            {errors.nickname?.message}
                        </p>
                    </div>
                    {serverError && (
                        <p className='signup-form-server-error'>{serverError}</p>
                    )}
                    <button
                        id="signup-btn"
                        type="submit"
                        disabled={!isButtonActive}
                        className={isButtonActive ? 'active' : ''}
                    >
                        {isSubmitting ? '처리 중...' : '회원가입'}
                    </button>
                </form>
                <a id="signup-to-login-link" href="/login">로그인하러 가기</a>
            </div>
        </div>
    );
}