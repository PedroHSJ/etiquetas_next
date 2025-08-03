"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2, Church, Users } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const getOrganizationIcon = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case "igreja":
      return Church;
    case "empresa":
      return Building2;
    default:
      return Users;
  }
};

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { isNavigating } = useNavigation();

  return <div></div>;
}
