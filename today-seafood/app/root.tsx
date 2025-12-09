import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ToastProvider } from "./features/shared/components/toast/ToastProvider";
import { ModalProvider } from "./features/shared/components/modal/ModalProvider";
import { NavigationProvider } from "./features/shared/lib/router/NavigationProvider";
import { UserProvider } from "./features/shared/lib/context/UserContext";
import { CommonHeader } from "./features/shared/components/common-header/CommonHeader";
import "./root.css";

console.log("테스트");
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

export default function Root() {
  return (
    <ModalProvider>
      <ToastProvider>
        <NavigationProvider>
          <UserProvider>
            <CommonHeader>
            </CommonHeader>
            <Outlet />
          </UserProvider>
        </NavigationProvider>
      </ToastProvider>
    </ModalProvider >
  );
}
