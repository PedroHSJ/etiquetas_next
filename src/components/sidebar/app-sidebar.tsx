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
  MapPin,
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
import { usePermissions } from "@/hooks/usePermissions";

// Mapeamento de rotas para módulos de permissão
const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/organizations": "ORGANIZATIONS",
  "/departments": "DEPARTMENTS",
  "/members": "MEMBERS",
  "/convites": "INVITES",
  "/estoque": "STOCK",
  "/enderecamento": "STOCK",
  "/etiquetas": "LABELS",
  "/technical-sheets": "TECHNICAL_SHEETS",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userId, loading } = useAuth();
  const { canRead, loading: permissionsLoading } = usePermissions();
  const pathname = usePathname();

  // Criar dados do usuário para o NavUser
  const userData = {
    name:
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário",
    email: user?.email || "usuario@exemplo.com",
    avatar: user?.user_metadata?.avatar_url || "",
  };

  // Função para verificar se o usuário tem permissão para acessar uma rota
  const hasPermissionForRoute = (url: string): boolean => {
    // Dashboard sempre visível
    if (url === "/dashboard") return true;

    // Encontrar o módulo de permissão baseado na rota
    for (const [route, module] of Object.entries(ROUTE_PERMISSION_MAP)) {
      if (url.startsWith(route)) {
        return canRead(module);
      }
    }

    // Se não houver mapeamento, permitir acesso
    return true;
  };

  // Filtrar itens do menu baseado nas permissões
  const filterNavItems = (items: typeof allNavItems): typeof allNavItems => {
    return items
      .map((item) => {
        // Se o item tem subitens, filtrar os subitens também
        if (item.items) {
          const filteredSubItems = item.items.filter((subItem) =>
            hasPermissionForRoute(subItem.url)
          );

          // Se não sobrou nenhum subitem, remover o item pai
          if (filteredSubItems.length === 0) {
            return null;
          }

          return {
            ...item,
            items: filteredSubItems,
          };
        }

        // Item simples sem subitens
        if (!hasPermissionForRoute(item.url)) {
          return null;
        }

        return item;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  // Todos os itens do menu (antes da filtragem)
  const allNavItems = [
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
      isActive:
        pathname.startsWith("/estoque") ||
        pathname.startsWith("/enderecamento"),
      items: [
        {
          title: "Estoque",
          url: "/estoque",
          isActive: pathname.startsWith("/estoque"),
          icon: Warehouse,
        },
        {
          title: "Endereçamento",
          url: "/enderecamento",
          isActive: pathname.startsWith("/enderecamento"),
          icon: MapPin,
        },
      ],
    },
    // {
    //   title: "Etiquetas",
    //   url: "/etiquetas",
    //   icon: Tags,
    //   isActive: pathname.startsWith("/etiquetas"),
    // },
    // {
    //   title: "Fichas Técnicas",
    //   url: "/technical-sheets/list",
    //   isActive: pathname.startsWith("/technical-sheets"),
    //   icon: Package,
    // },
  ];

  // Aplicar filtro de permissões
  const filteredNavItems = filterNavItems(allNavItems);

  const data = {
    user: userData,
    navMain: filteredNavItems,
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
        {loading || permissionsLoading ? (
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
