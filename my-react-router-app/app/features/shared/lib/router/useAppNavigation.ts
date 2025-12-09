import { useCallback } from "react";
import { useNavigate } from "react-router";

export function useAppNavigation() {
  const navigate = useNavigate();

  const goTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const canGoBack = window.history.length > 1;

  return { navigate: goTo, goBack, canGoBack };
}
