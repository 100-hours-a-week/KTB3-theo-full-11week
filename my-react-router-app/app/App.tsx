// App.tsx
import { Outlet } from "react-router-dom";
import { ToastProvider } from "./features/shared/toast/ToastProvider";
import { NavigationProvider } from "./features/shared/lib/router/NavigationProvider";
import "./app.css";

export default function App() {
  return (
    <ToastProvider>
      <NavigationProvider>
        <Outlet />
      </NavigationProvider>
    </ToastProvider>
  );
}
