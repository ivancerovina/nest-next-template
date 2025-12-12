import { SidebarInset, SidebarProvider, SidebarTrigger } from "@common/ui";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Outlet } from "react-router";
import { RequireAuth } from "@/features/auth";
import { HeaderActions } from "./header-actions";
import { AppSidebar } from "./sidebar/app-sidebar";
import { NavSide } from "./sidebar/nav-side";

export function HubLayout() {
  const [isOpen, setIsOpen] = useLocalStorage("sidebar-open", false);

  return (
    <RequireAuth>
      <div className="w-screen h-screen flex">
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
          <AppSidebar />
          <SidebarInset className="overflow-hidden min-h-0 max-h-svh">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
              </div>
              <div className="px-4">
                <HeaderActions />
              </div>
            </header>
            <div className="flex-1 min-h-0 min-w-0 p-4 pt-0">
              <div className="h-full w-full">
                <Outlet />
              </div>
            </div>
          </SidebarInset>
          <NavSide />
        </SidebarProvider>
      </div>
    </RequireAuth>
  );
}
