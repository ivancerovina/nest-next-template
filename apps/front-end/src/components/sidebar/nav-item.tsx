import { type SidebarNavigationItem } from "@common/plugin-sdk/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@common/ui";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

export type NavItemProps = {
  label: string;
  Icon: LucideIcon;
} & (
  | { to: string; children?: undefined }
  | {
      to?: undefined;
      children: { label: string; Icon: LucideIcon; to: string }[];
    }
);

export function NavItem({ label, Icon, to, children }: SidebarNavigationItem) {
  const { pathname } = useLocation();

  if (children) {
    const defaultOpen = !!children.find(({ to }) => to === pathname);
    return (
      <SidebarMenu key={label}>
        <Collapsible
          key={label}
          asChild
          defaultOpen={defaultOpen}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={label}>
                <Icon />
                <span>{label}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {children.map((child) => (
                  <SidebarMenuSubItem key={child.label}>
                    <SidebarMenuSubButton asChild>
                      <Link to={child.to}>
                        <span>{child.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    );
  }

  const isCurrent = pathname.startsWith(to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isCurrent} tooltip={label} asChild>
        <Link to={to}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
