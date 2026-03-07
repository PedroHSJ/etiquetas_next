"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronsUpDown, User } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { UserProfile } from "@/types/models/profile";

export function TeamSwitcher() {
  const { activeProfile, userProfiles, loading, setActiveProfile } =
    useProfile();
  const { setSelectedOrganization, selectedOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar();

  // Selecionar automaticamente se houver apenas um perfil
  useEffect(() => {
    if (userProfiles.length === 1) {
      const singleProfile = userProfiles[0];

      // Se não há perfil ativo, definir o único perfil disponível
      if (!activeProfile) {
        setActiveProfile(singleProfile);
      }

      // Sempre garantir que a organização está selecionada quando há apenas um perfil
      if (
        !selectedOrganization ||
        selectedOrganization.id !==
          singleProfile.userOrganization?.organization?.id
      ) {
        const org = singleProfile.userOrganization?.organization;
        if (org) {
          setSelectedOrganization(org);
        }
      }
    }
  }, [
    userProfiles,
    activeProfile,
    selectedOrganization,
    setActiveProfile,
    setSelectedOrganization,
  ]);

  // Sincronizar organização quando o perfil ativo mudar
  useEffect(() => {
    if (
      activeProfile &&
      (!selectedOrganization ||
        selectedOrganization.id !==
          activeProfile.userOrganization?.organization?.id)
    ) {
      const org = activeProfile.userOrganization?.organization;
      if (org) {
        setSelectedOrganization(org);
      }
    }
  }, [activeProfile, selectedOrganization, setSelectedOrganization]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!activeProfile || userProfiles.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center space-x-2 px-3 py-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-sm text-foreground group-data-[collapsible=icon]:hidden">
              Nenhum perfil disponível
            </span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const handleProfileChange = (profile: UserProfile) => {
    setActiveProfile(profile as unknown as typeof activeProfile);
    setOpen(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-bold flex items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground border-none">
                    {activeProfile?.profile?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  {activeProfile?.profile?.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground">
                  {selectedOrganization?.name ||
                    activeProfile?.userOrganization?.organization?.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal text-foreground">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Perfis disponíveis
                </p>
                <p className="text-xs leading-none text-foreground opacity-70">
                  Selecione um perfil para alternar
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userProfiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                className="cursor-pointer gap-3 p-2"
                onClick={() => {
                  const org = profile.userOrganization?.organization;
                  if (org) {
                    setSelectedOrganization(org);
                  }
                  handleProfileChange(profile as unknown as UserProfile);
                }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs font-bold text-foreground">
                      {profile?.profile?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">
                    {profile?.profile?.name}
                  </span>
                  <span className="truncate text-xs text-foreground opacity-70">
                    {profile.userOrganization?.organization?.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
