class AccessTokenStore {
    #accessToken = '';

    getAccessToken() {
        return this.#accessToken;
    }

    setAccessToken(accessToken) {
        console.log(accessToken);
        this.#accessToken = accessToken;
    }

    clear() {
        this.#accessToken = '';
    }

    hasAccessToken() {
        return !!this.#accessToken;
    }
}

export const accessTokenStore = new AccessTokenStore();