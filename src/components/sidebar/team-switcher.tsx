"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronsUpDown, Building2, User, MapPin, Phone } from "lucide-react";
import { Badge } from "../ui/badge";
import { UserProfile } from "@/types";

export function TeamSwitcher() {
  const { activeProfile, userProfiles, loading, setActiveProfile } =
    useProfile();
  const { setSelectedOrganization, selectedOrganization } = useOrganization();
  const { activeOrganizationDetails, detailsLoading } = useOrganization();
  const [open, setOpen] = useState(false);

  // Selecionar automaticamente se houver apenas um perfil
  useEffect(() => {
    if (userProfiles.length === 1) {
      const singleProfile = userProfiles[0];
      
      // Se não há perfil ativo, definir o único perfil disponível
      if (!activeProfile) {
        setActiveProfile(singleProfile);
      }
      
      // Sempre garantir que a organização está selecionada quando há apenas um perfil
      if (!selectedOrganization || selectedOrganization.id !== singleProfile.organizacao.id) {
        setSelectedOrganization(singleProfile.organizacao);
      }
    }
  }, [userProfiles, activeProfile, selectedOrganization, setActiveProfile, setSelectedOrganization]);

  // Sincronizar organização quando o perfil ativo mudar
  useEffect(() => {
    if (activeProfile && (!selectedOrganization || selectedOrganization.id !== activeProfile.organizacao.id)) {
      setSelectedOrganization(activeProfile.organizacao);
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
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="h-8 w-8 rounded-md bg-muted">
          <User className="h-4 w-4 m-2 text-muted-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">
          Nenhum perfil disponível
        </span>
      </div>
    );
  }

  const handleProfileChange = (profile: UserProfile) => {
    setActiveProfile(profile);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar perfil"
          className="w-full justify-between px-3 py-2 min-w-0"
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-xs">
                {activeProfile.perfil.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left min-w-0 flex-1">
              <span className="text-sm font-medium leading-none truncate max-w-full">
                {activeProfile.perfil.nome}
              </span>
              <span className="text-xs leading-none text-muted-foreground truncate max-w-full">
                {activeProfile.organizacao.nome}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              Perfis disponíveis
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Selecione um perfil para alternar
            </p>
          </div>
        </DropdownMenuLabel>
        
        {/* Informações detalhadas da organização atual */}
        {activeOrganizationDetails && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Organização Atual
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="h-3 w-3" />
                  <span className="font-medium">{activeOrganizationDetails.nome}</span>
                </div>
                {activeOrganizationDetails.cidade && activeOrganizationDetails.estado && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{activeOrganizationDetails.cidade}/{activeOrganizationDetails.estado}</span>
                  </div>
                )}
                {activeOrganizationDetails.telefone_principal && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{activeOrganizationDetails.telefone_principal}</span>
                  </div>
                )}
                {activeOrganizationDetails.capacidade_atendimento && (
                  <div className="text-xs text-muted-foreground">
                    Capacidade: {activeOrganizationDetails.capacidade_atendimento} refeições/dia
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        <DropdownMenuSeparator />
        {userProfiles.map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            className="cursor-pointer"
            onClick={() => {
              setSelectedOrganization(profile.organizacao);
              handleProfileChange(profile);
            }}
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="text-xs">
                  {profile.perfil.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium leading-none truncate">
                  {profile.perfil.nome}
                </span>
                <span className="text-xs leading-none text-muted-foreground truncate">
                  {profile.organizacao.nome}
                </span>
              </div>
              {profile.id === activeProfile.id && (
                <Badge variant="default" className="text-xs">
                  Ativo
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
