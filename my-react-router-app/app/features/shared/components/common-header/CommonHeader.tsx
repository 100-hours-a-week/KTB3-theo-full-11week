import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { apiPath } from "../../lib/path/apiPath";
import "../../styles/common-header/common-header.css"
import { useLogout } from "../../hooks/logout/useLogout";
import { useModal } from "../../hooks/modal/useModal";
import { useUserContext } from "../../lib/context/UserContext";

export function CommonHeader() {
    const { logoutWithModal } = useLogout();
    const { showModal } = useModal();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const profileImageSrc = user?.profileImage ?
        apiPath.PROFILE_IMAGE_STORATE_URL + user.profileImage : '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current) {
                return;
            }
            if (!containerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        }
    }, []);

    const handleBack = () => {
        navigate(-1);
    }

    const handleProfileClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    }

    const handleMenuAction = (action: string) => {
        if (!action) {
            return;
        }

        switch (action) {
            case "edit-profile":
                navigate('/editprofile');
                break;
            case "edit-password":
                navigate("/editpassword");
                break;
            case "logout":
                showModal({
                    title: "로그아웃 하시겠습니까?",
                    detail: "로그아웃 후에는 다시 로그인해야 서비스 이용이 가능합니다.",
                    onCancel: () => { },
                    onConfirm: async () => {
                        await logoutWithModal();
                    }
                })
                break;
            default:
                break;
        }

        setIsMenuOpen(false);
    }
    return (
        <div className="common-header-container" ref={containerRef}>
            <div className="common-header-wrapper">
                <div className="common-header-left">
                    <button id="common-back-btn" onClick={handleBack}>
                        &lt;
                    </button>
                </div>

                <div className="common-header-center">
                    바다의 가격을 가장 빠르게, 오늘의 수산
                </div>

                <div className="common-header-right">
                    <div className="profile-trigger">
                        <button
                            id="common-header-profile-btn"
                            type="button"
                            onClick={handleProfileClick}
                        >
                            {profileImageSrc ? (
                                <img
                                    id="common-header-userprofile"
                                    src={profileImageSrc}
                                    alt="사용자 프로필"
                                />
                            ) : (
                                ''
                            )}
                        </button>

                        {isMenuOpen && (
                            <div className="common-header-profile-menu">
                                <button
                                    className="header-profile-menu-btn"
                                    onClick={() => handleMenuAction("edit-profile")}
                                >
                                    회원정보 수정
                                </button>
                                <button
                                    className="header-profile-menu-btn"
                                    onClick={() => handleMenuAction("edit-password")}
                                >
                                    비밀번호 수정
                                </button>
                                <button
                                    className="header-profile-menu-btn"
                                    onClick={() => handleMenuAction("logout")}
                                >
                                    로그아웃
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}