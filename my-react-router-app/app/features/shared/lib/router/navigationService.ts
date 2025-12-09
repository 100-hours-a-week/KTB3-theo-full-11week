type NavigateArg = string | number;

type NavigateFn = (to: NavigateArg) => void;

let navigateFn: NavigateFn | null = null;

export function setNavigator(fn: NavigateFn) {
  navigateFn = fn;
}

export function navigate(to: string) {
  navigateFn?.(to);
}

export function goBack() {
  navigateFn?.(-1);
}

export function canGoBack(): boolean {
  return window.history.length > 1;
}
