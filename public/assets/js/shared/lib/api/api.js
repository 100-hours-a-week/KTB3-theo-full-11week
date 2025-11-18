
import { ApiError } from "./api-error.js";
import { apiPath } from "../../path/apiPath.js";

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
        const options = {
            method: this.#method,
            headers: this.#headers,
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

        const response = await fetch(url, options);
        const contentType = response.headers.get('Content-Type') || "";
        const canHaveJsonBody = ![204, 205].includes(response.status) && contentType.includes('application/json');
        let data = null;

        if (canHaveJsonBody) {
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }
        }

        // 4XX, 5XX 응답
        if (!response.ok) {
            // api 에러 처리
            const code = data.code;
            const status = response.status;
            const message = data.message;
            const path = data.path;
            throw new ApiError(code, status, message, path);
        }

        if (canHaveJsonBody) {
            return data;
        }
        // 2XX 응답
        return response;

    }
}