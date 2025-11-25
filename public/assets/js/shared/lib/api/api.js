
import { ApiError } from "./api-error.js";
import { apiPath } from "../../path/apiPath.js";
import { accessTokenStore } from "../jwt/access-token.js";

export class Api {
    #method = 'GET';
    #url = '';
    #headers = { 'Content-Type': 'application/json' };
    #body = {};
    #queryString = {};

    get() {
        this.#method = 'GET';
        return this;
    }

    post() {
        this.#method = 'POST';
        return this;
    }

    patch() {
        this.#method = 'PATCH';
        return this;
    }

    delete() {
        this.#method = 'DELETE';
        return this;
    }

    url(url = '') {
        this.#url = url;
        return this;
    }

    headers(headers = {}) {
        this.#headers = { ...this.#headers, ...headers }
        return this;
    }

    body(body = {}) {
        this.#body = structuredClone(body);
        return this;
    }

    toFormData() {
        const formData = new FormData();
        const body = Object.entries(this.#body);
        body.forEach(([key, value]) => {
            formData.append(key, value);
        })
        this.#body = formData;
        return this;
    }
    queryString(queryString = {}) {
        this.#queryString = { ...queryString };
        return this;
    }
    print() {
        console.log({
            method: this.#method,
            url: this.#url,
            headers: this.#headers,
            body: this.#body,
            queryString: this.#queryString
        });
        return this;
    }
    buildURL() {
        if (!this.#url) {
            throw new Error('URL이 필요합니다.');
        }
        const url = new URL(this.#url, apiPath.API_SERVER_URL);
        for (var key in this.#queryString) {
            url.searchParams.append(key, this.#queryString[key]);
        }
        return url.toString();
    }

    buildOptions() {
        const headers = { ...this.#headers };
        this.#addAuthorizationHeader(headers);

        const options = {
            method: this.#method,
            headers,
            credentials: "include",
        }

        // GET 요청은 Body 없이 전송
        if (this.#method === 'GET') {
            return options;
        }

        // FormData는 Content-Type 삭제
        if (this.#body instanceof FormData) {
            delete options.headers['Content-Type'];
            options.body = this.#body;
            return options;
        }

        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(this.#body);
        return options;

    }

    async request() {
        const url = this.buildURL();
        const options = this.buildOptions();

        const fetchResponse = await fetch(url, options);

        const canHaveJsonBody = this.#canHaveJsonBody(fetchResponse);

        const response = canHaveJsonBody ? await this.#toJson(fetchResponse) : fetchResponse;

        this.#throwIfError(fetchResponse, response);

        // 2XX 응답
        return response;

    }

    async #toJson(fetchResponse) {
        return await fetchResponse.json();
    }

    #throwIfError(fetchResponse, response) {
        if (!fetchResponse.ok) {
            // api 에러 처리
            const code = response.code;
            const status = fetchResponse.status;
            const message = response.message;
            const path = response.path;
            throw new ApiError(code, status, message, path);
        }
    }

    #canHaveJsonBody(fetchResponse) {
        const contentType = fetchResponse.headers.get('Content-Type') || "";
        return (![204, 205].includes(fetchResponse.status) && contentType.includes('application/json'));
    }

    #addAuthorizationHeader(headers) {
        const accessToken = accessTokenStore.getAccessToken();
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
    }

    #updateAccessTokenStore(fetchResponse) {
        const authorizationHeader = fetchResponse.headers.get('Authorization');
        if (!authorizationHeader) {
            return;
        }

        const [bearer, token] = authorizationHeader.split(' ');
        if (bearer === 'Bearer' && token) {
            accessTokenStore.setAccessToken(token);
        }
    }
}