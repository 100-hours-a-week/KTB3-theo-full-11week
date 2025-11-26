
import { ApiError } from "./api-error.js";
import { apiPath } from "../../path/apiPath.js";
import { accessTokenStore } from "../jwt/access-token.js";
import { navigate } from "../router.js";
import { toast } from "../../ui/toast/js/toast.js";

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

    async request(isRetry = false) {
        const url = this.buildURL();
        const options = this.buildOptions();

        const fetchResponse = await fetch(url, options);
        this.#updateAccessTokenStore(fetchResponse.headers);

        const canHaveJsonBody = this.#canHaveJsonBody(fetchResponse);

        const response = canHaveJsonBody ? await this.#toJson(fetchResponse) : fetchResponse;

        if (!fetchResponse.ok) {
            const status = fetchResponse.status;
            if (status === 401 && !isRetry) {
                await this.#refreshAccessTokenRequest();
                return this.request(true);
            }

            const { code, message, path } = response;
            throw new ApiError(code, status, message, path);
        }
        // 2XX 응답
        return response;
    }

    async #toJson(fetchResponse) {
        return await fetchResponse.json();
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

    #updateAccessTokenStore(headers) {
        const authorizationHeader = headers.get('Authorization');
        if (!authorizationHeader) {
            return;
        }

        const [bearer, token] = authorizationHeader.split(' ');
        if (bearer === 'Bearer' && token) {
            accessTokenStore.setAccessToken(token);
        }
    }

    async #refreshAccessTokenRequest() {
        console.log("엑세스 토큰 재발급");
        try {
            await new Api()
                .post()
                .url(apiPath.ACCESS_TOKEN_REFRESH_API_URL)
                .request(true);
        } catch (error) {
            if (error instanceof ApiError) {
                const isRefreshTokenExpired =
                    (error.status === 401 || error.status === 403);

                if (isRefreshTokenExpired) {
                    this.#handleRefreshTokenExpired();
                    return;
                }
            }
        }


    }

    #handleRefreshTokenExpired() {
        const toastLogic = {
            title: "재로그인이 필요합니다.",
            buttonTitle: "닫기",
            buttonLogic: function () {
                navigate('/logout');
            }
        };
        const toastComponent = toast(toastLogic);
        document.body.appendChild(toastComponent);

        accessTokenStore.clear?.();
        console.log("리프레시 토큰 만료");
        navigate('/logout');

    }
}