import type { RouteObject } from "react-router";
import { SystemOverviewPage } from "./pages/system-overview-page";

export const systemRoutes: RouteObject[] = [
  {
    path: "system",
    children: [
      {
        index: true,
        element: <SystemOverviewPage />,
      },
    ],
  },
];
