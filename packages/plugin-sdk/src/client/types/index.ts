import { ComponentType } from "react";
import type { RouteObject } from "react-router";
export type ClientPluginDefinition = {
  routes: RouteObject[];
  sidebarItems?: SidebarNavigationItem[];
};

type SidebarNavigationItemChild = {
  label: string;
  to: string;
};

export type SidebarNavigationItem = {
  label: string;
  Icon: ComponentType;
} & (
  | { to: string; children?: undefined }
  | {
      to?: undefined;
      children: SidebarNavigationItemChild[];
    }
);
