"use client";

import { type LucideIcon } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
      icon?: LucideIcon;
    }[];
  }[];
}) {
  return (
    <>
      {items.map((item) => (
        <SidebarGroup key={item.title}>
          <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
          <SidebarMenu>
            {item.items && item.items.length > 0 ? (
              item.items.map((subItem) => (
                <SidebarMenuItem key={subItem.title}>
                  <SidebarMenuButton asChild isActive={subItem.isActive}>
                    <NavigationLink href={subItem.url}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                    </NavigationLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <NavigationLink href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </NavigationLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
