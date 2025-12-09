import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { LOCAL_STORAGE_KEY } from "../util/localstorage";

export type User = {
    id: number;
    nickname: string;
    profileImage: string | null;
    likedPostId: string | null;
}

type UserContextValue = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === "undefined") {
            return null;
        }

        const id = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID);
        const nickname = localStorage.getItem(LOCAL_STORAGE_KEY.NICKNAME);
        const profileImage = localStorage.getItem(LOCAL_STORAGE_KEY.PROFILE_IMAGE);
        const likedPostId = localStorage.getItem(LOCAL_STORAGE_KEY.LIKED_POST_ID);

        if (!id || !nickname) {
            return null;
        }

        return {
            id: Number(id),
            nickname: nickname,
            profileImage: profileImage ?? null,
            likedPostId: likedPostId,
        };

    })

    const contextValue: UserContextValue = {
        user,
        setUser,
    }

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export function useUserContext() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error("useUserContext는 UserProvider 안에서만 사용가능 합니다.");
    }
    return ctx;
}