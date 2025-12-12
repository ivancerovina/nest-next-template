import { plugins } from "virtual:external-plugins";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { ErrorPage } from "./components/error-page";
import { HubLayout } from "./components/hub-layout";
import { AuthLayout } from "./features/auth/auth-layout";
import { LoginPage } from "./features/auth/pages/login-page";
import { systemRoutes } from "./features/system/system-routes";

const pluginRoutes: RouteObject[] = plugins.flatMap(
  (plugin) => plugin.routes ?? [],
);

const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/hub",
    element: <HubLayout />,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        element: <div>home</div>,
      },
      ...systemRoutes,
      ...pluginRoutes,
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    ErrorBoundary: ErrorPage,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
