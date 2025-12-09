import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, useNavigate as useNavigate$1 } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useNavigate, Outlet } from "react-router-dom";
import { createContext, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function Toast({ title, buttonTitle, onClick }) {
  return /* @__PURE__ */ jsx("div", { className: "toast-container", children: /* @__PURE__ */ jsxs("div", { className: "toast-wrapper", children: [
    /* @__PURE__ */ jsx("h2", { className: "toast-title", children: title }),
    /* @__PURE__ */ jsx(
      "button",
      {
        id: "toast-btn",
        type: "button",
        onClick,
        children: buttonTitle
      }
    )
  ] }) });
}
let listener = null;
const toastService = {
  subscribe(fn) {
    listener = fn;
    return () => {
      if (listener === fn) {
        listener = null;
      }
    };
  },
  show(toast) {
    listener?.(toast);
  },
  clear() {
    listener?.(null);
  }
};
const ToastContext = createContext(null);
function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((options) => {
    setToast(options);
  }, []);
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);
  useEffect(() => {
    const unsubscribe = toastService.subscribe((options) => {
      if (!options) {
        setToast(null);
        return;
      }
      setToast(options);
    });
    return unsubscribe;
  }, []);
  const contextValue = {
    showToast,
    hideToast
  };
  const handleClick = () => {
    if (toast?.onClick) {
      toast.onClick();
    }
    hideToast();
  };
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: contextValue, children: [
    children,
    toast && /* @__PURE__ */ jsx(
      Toast,
      {
        title: toast.title,
        buttonTitle: toast.buttonTitle,
        onClick: handleClick
      }
    )
  ] });
}
function NavigationProvider({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
  }, [navigate]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const root = UNSAFE_withComponentProps(function Root() {
  return /* @__PURE__ */ jsx(ToastProvider, {
    children: /* @__PURE__ */ jsx(NavigationProvider, {
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const _index = UNSAFE_withComponentProps(function IndexRoute() {
  console.log("한글 깨지나요?");
  return /* @__PURE__ */ jsx("div", {
    children: "홈 화면입니다."
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _index
}, Symbol.toStringTag, { value: "Module" }));
const regex = {
  EMAIL: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,}$/i,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/
};
Object.freeze(regex);
function isEmail(email) {
  return Boolean(regex.EMAIL.test(email));
}
function isValidPasswordPattern(password) {
  return Boolean(regex.PASSWORD.test(password));
}
function isBetweenLength(str, min, max) {
  return str.length >= min && str.length <= max;
}
function LoginPage() {
  const navigate = useNavigate$1();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    getValues
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = async () => {
    if (!isValid) return;
    setServerError("");
  };
  const helperText = errors.email?.message || errors.password?.message || serverError || "";
  const isButtonActive = isValid && !isSubmitting;
  return /* @__PURE__ */ jsx("div", { className: "login-container", children: /* @__PURE__ */ jsxs("div", { className: "login-wrapper", children: [
    /* @__PURE__ */ jsx("h2", { children: "로그인" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        "form",
        {
          id: "login-form",
          onSubmit: handleSubmit(onSubmit),
          noValidate: true,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "login-field", children: [
              /* @__PURE__ */ jsx("label", { className: "login-label", htmlFor: "login-form-email", children: "이메일" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "login-form-email",
                  type: "email",
                  className: "login-input",
                  placeholder: "이메일을 입력하세요",
                  "aria-invalid": !!errors.email || void 0,
                  ...register("email", {
                    required: "이메일을 입력해주세요",
                    validate: {
                      format: (value) => isEmail(value.trim()) || "올바른 이메일 주소 형식을 입력해주세요. example@example.com"
                    }
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "login-field", children: [
              /* @__PURE__ */ jsx("label", { className: "login-label", htmlFor: "login-form-password", children: "비밀번호" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "login-form-password",
                  type: "password",
                  className: "login-input",
                  placeholder: "비밀번호를 입력하세요",
                  "aria-invalid": !!errors.password || void 0,
                  ...register("password", {
                    required: "비밀번호를 입력해주세요",
                    validate: {
                      pattern: (value) => isValidPasswordPattern(value.trim()) || "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 특수문자를 각각 최소 1개 포함해야 합니다.",
                      length: (value) => isBetweenLength(value.trim(), 8, 20) || "비밀번호는 8자 이상, 20자 이하입니다."
                    }
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { id: "login-form-helper-text", children: helperText }),
            /* @__PURE__ */ jsx(
              "button",
              {
                id: "login-btn",
                type: "submit",
                disabled: !isButtonActive,
                className: isButtonActive ? "active" : "",
                children: isSubmitting ? "로그인 중..." : "로그인"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          id: "login-to-signup-link",
          href: "/signup",
          className: "router-link",
          onClick: (e) => {
            e.preventDefault();
            navigate("/signup");
          },
          children: "회원가입"
        }
      )
    ] })
  ] }) });
}
const login = UNSAFE_withComponentProps(function LoginRoute() {
  return /* @__PURE__ */ jsx(LoginPage, {});
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-22feAV_4.js", "imports": ["/assets/chunk-FGUA77HG-BlJy1YyJ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-CYLtLHsg.js", "imports": ["/assets/chunk-FGUA77HG-BlJy1YyJ.js"], "css": ["/assets/root-CaYVnqAt.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/_index-CUayu6WA.js", "imports": ["/assets/chunk-FGUA77HG-BlJy1YyJ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-CrFUN4TY.js", "imports": ["/assets/chunk-FGUA77HG-BlJy1YyJ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-491e5dea.js", "version": "491e5dea", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
