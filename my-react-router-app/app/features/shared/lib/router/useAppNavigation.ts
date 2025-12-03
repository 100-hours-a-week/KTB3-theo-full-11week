import { useCallback } from "react";
import { useNavigate } from "react-router";

export function useAppNavigation() {
  const navigate = useNavigate();

  const goTo = useCallback((path: string) => {
      navigate(path);
    },[navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  },[navigate]);

  // 완벽하진 않지만 대충 "뒤로가기 가능?" 체크용
  const canGoBack = window.history.length > 1;

  return { navigate: goTo, goBack, canGoBack };
}
