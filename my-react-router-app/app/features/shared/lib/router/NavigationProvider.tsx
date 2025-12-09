import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigator } from "./navigationService";

export function NavigationProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();

    useEffect(() => {
        setNavigator((to) => {
            navigate(to as any);
        });
    }, [navigate]);

    return <>{children}</>;
}
