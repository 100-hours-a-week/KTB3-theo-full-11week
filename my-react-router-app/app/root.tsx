// app/root.tsx
import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ToastProvider } from "./features/shared/components/toast/ToastProvider";
import { NavigationProvider } from "./features/shared/lib/router/NavigationProvider";
import "./root.css";

// 🔹 문서 전체 레이아웃 (HTML 껍데기)
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* ★ 이거 하나로 인코딩 문제 거의 끝 */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>오늘의 수산</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 🔹 실제 앱 루트 (Provider + Outlet)
export default function Root() {
  return (
    <ToastProvider>
      <NavigationProvider>
        <Outlet />
      </NavigationProvider>
    </ToastProvider>
  );
}
