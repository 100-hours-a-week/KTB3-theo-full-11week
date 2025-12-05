// app/features/shared/toast/useToast.ts
import { toastService, type ToastOptions } from "../../components/toast/toastService"
import { useToastContext } from "../../components/toast/ToastProvider"

/**
 * 리액트 컴포넌트 안에서 쓰는 용도
 * - 내부적으로는 Context를 쓰고
 * - Provider 밖에서도 쓸 수 있게 싶으면 toastService.show 직접 써도 됨
 */
export function useToast() {
  const { showToast, hideToast } = useToastContext();

  const open = (options: ToastOptions) => {
    showToast(options);
  };

  const close = () => {
    hideToast();
  };

  return {
    showToast: open,
    hideToast: close,
  };
}

/**
 * 리액트 바깥(예: Api 클래스)에서 쓰고 싶을 땐 이걸 import
 * toastService.show({ title, buttonTitle, onClick });
 */
export { toastService };
