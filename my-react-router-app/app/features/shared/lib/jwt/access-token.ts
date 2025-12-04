class AccessTokenStore {
  private readonly STORAGE_KEY: string
    = (typeof import.meta !== "undefined" && import.meta.env.VITE_SESSION_STORAGE_KEY)
    || "";

  getAccessToken(): string {
    if (typeof window === "undefined") {
      return ""
    }
    return sessionStorage.getItem(this.STORAGE_KEY) ?? "";
  }

  setAccessToken(accessToken: string): void {
    if (typeof window === "undefined") {
      return;
    }
    return sessionStorage.setItem(this.STORAGE_KEY, accessToken);
  }

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }
    sessionStorage.removeItem(this.STORAGE_KEY)
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
}

export const accessTokenStore = new AccessTokenStore();
