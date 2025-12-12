import { JotaiStore, queryClient } from "@common/plugin-sdk/client";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider } from "jotai";
import { RouterProvider } from "react-router";
import { SessionProvider } from "@/features/auth";
import { ThemeProvider } from "./components/theme-provider";
import { router } from "./router";

function App() {
  return (
    <JotaiProvider store={JotaiStore}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TanStackDevtools
            plugins={[
              {
                name: "TanStack Query",
                render: <ReactQueryDevtoolsPanel />,
                defaultOpen: true,
              },
            ]}
          />
          <SessionProvider>
            <RouterProvider router={router} />
          </SessionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}

export default App;
