// app/features/shared/lib/api/api.ts
import { apiPath } from "../path/apiPath";
import { ApiError } from "./apiError";
import { accessTokenStore } from "../jwt/access-token";
import { toastService } from "../../toast/toastService";
import { navigate } from "../router/navigationService";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
type HeadersMap = Record<string, string>;
type QueryStringValue = string | number | boolean;
type QueryStringMap = Record<string, QueryStringValue>;
type JsonBody = Record<string, unknown> | FormData;

export class Api {
  private _method: HttpMethod = "GET";
  private _url: string = "";
  private _headers: HeadersMap = { "Content-Type": "application/json" };
  private _body: JsonBody | {} = {};
  private _queryString: QueryStringMap = {};

  get(): this {
    this._method = "GET";
    return this;
  }

  post(): this {
    this._method = "POST";
    return this;
  }

  patch(): this {
    this._method = "PATCH";
    return this;
  }

  delete(): this {
    this._method = "DELETE";
    return this;
  }

  url(url: string = ""): this {
    this._url = url;
    return this;
  }

  headers(headers: HeadersMap = {}): this {
    this._headers = { ...this._headers, ...headers };
    return this;
  }

  body(body: Record<string, any> = {}): this {
    this._body = structuredClone(body);
    return this;
  }

  toFormData(): this {
    const formData = new FormData();
    const entries = Object.entries(this._body as Record<string, any>);
    entries.forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    this._body = formData;
    return this;
  }

  queryString(queryString: QueryStringMap = {}): this {
    this._queryString = { ...queryString };
    return this;
  }

  print(): this {
    console.log({
      method: this._method,
      url: this._url,
      headers: this._headers,
      body: this._body,
      queryString: this._queryString,
    });
    return this;
  }

  private buildURL(): string {
    if (!this._url) {
      throw new Error("URL이 필요합니다.");
    }

    const requestUrl = new URL(this._url, apiPath.API_SERVER_URL);

    Object.entries(this._queryString).forEach(([key, value]) => {
      requestUrl.searchParams.append(key, String(value));
    });

    return requestUrl.toString();
  }

  private buildOptions(): RequestInit {
    const requestHeaders: HeadersMap = { ...this._headers };
    this.addAuthorizationHeader(requestHeaders);

    const options: RequestInit = {
      method: this._method,
      headers: requestHeaders,
      credentials: "include",
    };

    if (this._method === "GET") {
      return options;
    }

    if (this._body instanceof FormData) {
      if (options.headers && "Content-Type" in options.headers) {
        delete (options.headers as HeadersMap)["Content-Type"];
      }
      options.body = this._body;
      return options;
    }

    (options.headers as HeadersMap)["Content-Type"] = "application/json";
    options.body = JSON.stringify(this._body);
    return options;
  }

  async request<TResponse = any>(isRetry: boolean = false): Promise<TResponse> {
    const url = this.buildURL();
    const options = this.buildOptions();

    const fetchResponse = await fetch(url, options);
    this.updateAccessTokenStore(fetchResponse.headers);

    const canHaveJsonBody = this.canHaveJsonBody(fetchResponse);
    const response = canHaveJsonBody
      ? await this.toJson(fetchResponse)
      : fetchResponse;

    if (!fetchResponse.ok) {
      const status = fetchResponse.status;

      if (status === 401 && !isRetry) {
        await this.refreshAccessTokenRequest();
        return this.request<TResponse>(true);
      }

      const { code, message, path } = response as {
        code: string;
        message: string;
        path: string;
      };

      throw new ApiError(code, status, message, path);
    }

    return response as TResponse;
  }

  private async toJson(fetchResponse: Response): Promise<any> {
    return await fetchResponse.json();
  }

  private canHaveJsonBody(fetchResponse: Response): boolean {
    const contentType = fetchResponse.headers.get("Content-Type") || "";
    return (
      ![204, 205].includes(fetchResponse.status) &&
      contentType.includes("application/json")
    );
  }

  private addAuthorizationHeader(headers: HeadersMap): void {
    const accessToken = accessTokenStore.getAccessToken();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  private updateAccessTokenStore(headers: Headers): void {
    const authorizationHeader = headers.get("Authorization");
    if (!authorizationHeader) {
      return;
    }

    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      accessTokenStore.setAccessToken(token);
    }
  }

  private async refreshAccessTokenRequest(): Promise<void> {
    console.log("엑세스 토큰 재발급");
    try {
      await new Api()
        .post()
        .url(apiPath.ACCESS_TOKEN_REFRESH_API_URL)
        .request(true);
    } catch (error) {
      if (error instanceof ApiError) {
        const isRefreshTokenExpired =
          error.status === 401 || error.status === 403;

        if (isRefreshTokenExpired) {
          this.handleRefreshTokenExpired();
          return;
        }
      }
    }
  }

  private handleRefreshTokenExpired(): void {
    toastService.show({
      title: "재로그인이 필요합니다.",
      buttonTitle: "닫기",
      onClick() {
        navigate("/logout");
      },
    });

    accessTokenStore.clear();
    console.log("리프레시 토큰 만료");
  }
}
