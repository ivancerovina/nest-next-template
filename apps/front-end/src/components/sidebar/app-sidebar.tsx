import { plugins } from "virtual:external-plugins";
import type { SidebarNavigationItem } from "@common/plugin-sdk/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@common/ui";
import { Calendar, House } from "lucide-react";
import type * as React from "react";
import { NavHeader } from "./nav-header";
import { NavItem } from "./nav-item";
import { NavUser } from "./nav-user";

const pluginNavItems = plugins.flatMap((p) => p.sidebarItems || []);

const navItems: SidebarNavigationItem[] = [
  {
    label: "Home",
    Icon: House,
    to: "/hub",
  },
  {
    label: "Calendar",
    Icon: Calendar,
    to: "/hub/calendar",
  },
  ...pluginNavItems,
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            {navItems.map((props) => (
              <NavItem key={props.label} {...props} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
