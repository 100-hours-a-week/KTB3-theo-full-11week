class AccessTokenStore {
  private accessToken: string = "";

  getAccessToken(): string {
    return this.accessToken;
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  clear(): void {
    this.accessToken = "";
  }

  hasAccessToken(): boolean {
    return !!this.accessToken;
  }
}

export const accessTokenStore = new AccessTokenStore();
