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
import { CommonHeader } from "./features/shared/components/common-header/CommonHeader";
import "./root.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
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
        <CommonHeader>
        </CommonHeader>
        <Outlet />
      </NavigationProvider>
    </ToastProvider>
  );
}
