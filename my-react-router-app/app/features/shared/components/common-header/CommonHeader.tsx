import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { apiPath } from "../../lib/path/apiPath";
import "../../styles/common-header/common-header.css"
import { useLogout } from "../../hooks/logout/useLogout";
import { useModal } from "../../hooks/modal/useModal";

export function CommonHeader() {
    const logout = useLogout();
    const { showModal, hideModel } = useModal();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(() => {
        if (typeof window === "undefined") {
            return null;
        }
        return localStorage.getItem('profileImage');
    });

    const profileImageUrl = profileImage != null
        ? apiPath.PROFILE_IMAGE_STORATE_URL + profileImage : '';

    // 바깥 클릭 시 메뉴 닫기
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

    // 뒤로가기
    const handleBack = () => {
        navigate(-1);
    }

    // 프로빌 버튼 클릭(메뉴 토글)
    const handleProfileClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    }

    // 메뉴 공통 액션 처리
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
                        await logout();
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
                {/* 왼쪽: 뒤로가기 */}
                <div className="common-header-left">
                    <button id="common-back-btn" onClick={handleBack}>
                        &lt;
                    </button>
                </div>

                {/* 가운데: 타이틀 */}
                <div className="common-header-center">
                    바다의 가격을 가장 빠르게, 오늘의 수산
                </div>

                {/* 오른쪽: 프로필/메뉴 */}
                <div className="common-header-right">
                    <div className="profile-trigger">
                        <button
                            id="common-header-profile-btn"
                            type="button"
                            onClick={handleProfileClick}
                        >
                            {profileImage ? (
                                <img
                                    id="common-header-userprofile"
                                    src={profileImageUrl}
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