"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  SquareTerminal,
  Package,
  Mail,
  Warehouse,
  Building2,
  House,
  FolderTree,
  Tags,
  LayoutGrid,
  Building,
  UserCog,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { NavUser } from "./nav-user";
import { useAuth } from "@/contexts/AuthContext";
// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userId, loading } = useAuth();
  const pathname = usePathname();

  // Criar dados do usuário para o NavUser
  const userData = {
    name:
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário",
    email: user?.email || "usuario@exemplo.com",
    avatar: user?.user_metadata?.avatar_url || "",
  };

  const data = {
    user: userData,
    navMain: [
      {
        title: "Início",
        url: "/dashboard",
        icon: GalleryVerticalEnd,
        isActive: pathname === "/dashboard",
      },
      {
        title: "Estrutura",
        url: "#",
        isActive:
          pathname.startsWith("/members") ||
          pathname.startsWith("/organizations") ||
          pathname.startsWith("/departments") ||
          pathname.startsWith("/specializations"),
        items: [
          {
            title: "Organização",
            url: "/organizations/list",
            isActive: pathname.startsWith("/organizations"),
            icon: Building,
          },
          {
            title: "Departamentos",
            url: "/departments/list",
            isActive: pathname.startsWith("/departments"),
            icon: LayoutGrid,
          },
          {
            title: "Membros",
            url: "/members/list",
            isActive: pathname.startsWith("/members"),
            icon: UserCog,
          },
        ],
      },
      {
        title: "Convites",
        url: "/convites",
        icon: Mail,
        isActive: pathname.startsWith("/convites"),
      },
      {
        title: "Estoque",
        url: "/estoque",
        icon: Warehouse,
        isActive: pathname.startsWith("/estoque"),
      },
      // {
      //   title: "Etiquetas",
      //   url: "/etiquetas",
      //   icon: Tags,
      //   isActive: pathname.startsWith("/etiquetas"),
      // },
      {
        title: "Fichas Técnicas",
        url: "/technical-sheets/list",
        isActive: pathname.startsWith("/technical-sheets"),
        icon: Package,
      },
    ],
  };
  return (
    <Sidebar {...props} variant="inset">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <span>Carregando...</span>
          </div>
        ) : (
          <NavUser user={data.user} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
