import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ApiError } from "~/features/shared/lib/api/apiError";
import {
    requestCurrentUser,
    requestNicknameDuplication,
    requestProfileEdit,
    requestDeleteUser,
} from "~/features/shared/lib/api/user-api";
import { useUserContext } from "~/features/shared/lib/context/UserContext";
import { apiPath } from "~/features/shared/lib/path/apiPath";
import { LOCAL_STORAGE_KEY } from "~/features/shared/lib/util/localstorage";
import { isBlank, isFile, isOverMaxLength } from "~/features/shared/lib/util/util";
import { useToast, toastService } from "~/features/shared/hooks/toast/useToast";
import { useModal } from "~/features/shared/hooks/modal/useModal";
import "../../styles/edit-profile/edit-profile.css";
import { useLogout } from "~/features/shared/hooks/logout/useLogout";

type EditProfileFormValues = {
    nickname: string;
};

export function EditProfilePage() {
    const navigate = useNavigate();
    const { logoutWithoutModal } = useLogout();
    const { user, setUser } = useUserContext();
    const { showToast } = useToast();
    const { showModal } = useModal();

    // 이메일은 User 타입에 없으니까 로컬 state로만 관리
    const [email, setEmail] = useState("");
    const [oldImageName, setOldImageName] = useState<string | null>(null);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDuplicateNickname, setIsDuplicateNickname] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        trigger,
        formState: { errors, isValid, isDirty, isSubmitting },
    } = useForm<EditProfileFormValues>({
        mode: "onChange",
        defaultValues: {
            nickname: "",
        },
    });

    const nicknameValue = watch("nickname");

    useEffect(() => {
        // if (user) {
        //     setOldImageName(user.profileImage ?? null);
        //     reset({ nickname: user.nickname });
        //     setIsLoading(false);
        //     return;
        // }

        const userId = Number(localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID));
        if (!userId) {
            navigate("/login", { replace: true });
            return;
        }

        let isMounted = true;

        const load = async () => {
            try {
                const response = await requestCurrentUser(userId);
                if (!isMounted) return;

                const data = response.data;

                setEmail(data.email);
                setOldImageName(data.profileImage ?? null);
                reset({ nickname: data.nickname });

                setUser((prev) => ({
                    id: data.id,
                    nickname: data.nickname,
                    profileImage: data.profileImage,
                    likedPostId: prev?.likedPostId ?? data.likedPostId,
                }));
            } catch (error) {
                if (error instanceof ApiError) {
                    showToast({
                        title: error.message ?? "회원 정보를 불러오지 못했습니다.",
                        buttonTitle: "닫기",
                        onClick() {
                            toastService.clear();
                        },
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [navigate, reset, setUser]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const profileImageSrc =
        previewUrl ?? (oldImageName ? apiPath.PROFILE_IMAGE_STORATE_URL + oldImageName : "");

    // 파일 선택 핸들러
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            setNewFile(null);
            setPreviewUrl(null);
            return;
        }

        if (!isFile(file)) {
            showToast({
                title: "이미지 파일만 업로드 가능합니다.",
                buttonTitle: "닫기",
                onClick() {
                    toastService.clear();
                },
            });
            return;
        }

        setNewFile(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleNicknameBlur = async () => {
        const valid = await trigger("nickname");
        if (!valid) return;

        const nickname = nicknameValue?.trim() ?? "";
        if (isBlank(nickname)) return;

        try {
            const response = await requestNicknameDuplication(nickname);
            const { available } = response.data;
            setIsDuplicateNickname(!available);
        } catch (error) {
            if (error instanceof ApiError) {
                showToast({
                    title: error.message ?? "닉네임 중복 검사에 실패했습니다.",
                    buttonTitle: "닫기",
                    onClick() {
                        toastService.clear();
                    },
                });
            }
        }
    };

    useEffect(() => {
        if (!isDirty) return;
        setIsDuplicateNickname(false);
    }, [nicknameValue, isDirty]);

    const nicknameHelperText =
        errors.nickname?.message ||
        (isDuplicateNickname ? "중복된 닉네임입니다." : "");

    const canSubmit =
        !isLoading && isDirty && isValid && !isDuplicateNickname && !isSubmitting && !!nicknameValue?.trim();

    const onSubmit = async (values: EditProfileFormValues) => {
        if (!user) return;

        const nickname = values.nickname.trim();
        if (isBlank(nickname)) return;

        try {
            const oldFileName =
                user.profileImage ??
                localStorage.getItem(LOCAL_STORAGE_KEY.PROFILE_IMAGE) ??
                null;

            const profileImage: File = newFile ?? new File([], "", { type: "application/octet-stream" });

            const response = await requestProfileEdit(
                user.id,
                oldFileName,
                profileImage,
                nickname
            );

            const responseBody = response.data as {
                profileImage: string | null;
                nickname: string;
            };

            const newProfileImage = responseBody.profileImage;

            if (newProfileImage) {
                localStorage.setItem(LOCAL_STORAGE_KEY.PROFILE_IMAGE, newProfileImage);
            }
            localStorage.setItem(LOCAL_STORAGE_KEY.NICKNAME, nickname);

            setUser((prev) =>
                prev
                    ? {
                        ...prev,
                        nickname,
                        profileImage: newProfileImage,
                    }
                    : prev
            );
            setIsDuplicateNickname(true);

            showToast({
                title: "수정 완료",
                buttonTitle: "닫기",
                onClick() {
                    toastService.clear();
                },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                showToast({
                    title: error.message ?? "회원 정보 수정에 실패했습니다.",
                    buttonTitle: "닫기",
                    onClick() {
                        toastService.clear();
                    },
                });
            }
        }
    };

    const handleUnsubscribe = () => {
        showModal({
            title: "회원탈퇴 하시겠습니까?",
            detail: "작성된 게시글과 댓글은 삭제됩니다.",
            onCancel: () => { },
            onConfirm: async () => {
                try {
                    const userIdStr = Number(localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID))
                    await requestDeleteUser(userIdStr);
                    logoutWithoutModal();
                } catch (error) {
                    if (error instanceof ApiError) {
                        showToast({
                            title: error.message ?? "회원 탈퇴에 실패했습니다.",
                            buttonTitle: "닫기",
                            onClick() {
                                toastService.clear();
                            },
                        });
                    }
                }
            },
        });
    };

    const handleGoPostList = () => {
        navigate("/postlist");
    };

    if (isLoading) {
        return (
            <div className="edit-profile-container">
                <div className="edit-profile-wrapper">
                    <p>회원 정보를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="edit-profile-container">
                <div className="edit-profile-wrapper">
                    <p>로그인이 필요합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-wrapper">
                <h2>회원정보수정</h2>
                <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="edit-profile-field">
                        <label
                            className="edit-profile-label"
                            htmlFor="edit-profile-form-profile-image"
                        >
                            프로필 사진*
                        </label>
                        <input
                            id="edit-profile-form-profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                        <button
                            id="edit-profile-image-upload-btn"
                            type="button"
                            className="edit-profile-image-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img
                                id="edit-profile-image-preview"
                                src={profileImageSrc}
                                alt="프로필 사진 미리보기"
                            />
                        </button>
                    </div>

                    <div className="edit-profile-field">
                        <label className="edit-profile-label">이메일*</label>
                        <p>{email}</p>
                    </div>

                    <div className="edit-profile-field">
                        <label
                            className="edit-profile-label"
                            htmlFor="edit-profile-form-nickname"
                        >
                            닉네임
                        </label>
                        <input
                            id="edit-profile-form-nickname"
                            type="text"
                            className="edit-profile-input"
                            placeholder="닉네임을 입력하세요"
                            {...register("nickname", {
                                required: "닉네임을 입력해주세요",
                                validate: {
                                    blank: (value) =>
                                        !isBlank(value.trim()) || "닉네임을 입력해주세요",
                                    maxLen: (value) =>
                                        !isOverMaxLength(value.trim(), 10) ||
                                        "닉네임은 최대 10자까지 작성 가능합니다.",
                                },
                            })}
                            onBlur={handleNicknameBlur}
                        />
                        <p className="edit-profile-form-helper-text">
                            {nicknameHelperText}
                        </p>
                    </div>

                    <button
                        id="edit-profile-update-btn"
                        type="submit"
                        disabled={!canSubmit}
                        className={canSubmit ? "active" : ""}
                    >
                        {isSubmitting ? "수정 중..." : "수정하기"}
                    </button>
                </form>

                <button
                    id="edit-profile-to-unsubscribe-link"
                    type="button"
                    onClick={handleUnsubscribe}
                >
                    회원 탈퇴
                </button>
                <button
                    id="edit-profile-to-posts"
                    type="button"
                    onClick={handleGoPostList}
                >
                    수정완료
                </button>
            </div>
        </div>
    );
}
