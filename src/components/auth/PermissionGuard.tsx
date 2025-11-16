"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Spinner } from "../ui/spinner";

interface PermissionGuardProps {
  funcionalidade: string;
  acao: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function PermissionGuard({
  funcionalidade,
  acao,
  children,
  fallback,
  loadingFallback,
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-4">
          <Spinner />
          <span className="ml-2 text-sm text-muted-foreground">
            Verificando permissões...
          </span>
        </div>
      )
    );
  }

  if (!hasPermission(funcionalidade, acao)) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-4 text-center">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-red-600">
              Acesso Negado
            </div>
            <div className="text-sm text-muted-foreground">
              Você não tem permissão para {acao} {funcionalidade}.
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Componentes de conveniência para ações comuns
export function ViewGuard({
  funcionalidade,
  children,
  fallback,
  loadingFallback,
}: Omit<PermissionGuardProps, "acao">) {
  return (
    <PermissionGuard
      funcionalidade={funcionalidade}
      acao="visualizar"
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function CreateGuard({
  funcionalidade,
  children,
  fallback,
  loadingFallback,
}: Omit<PermissionGuardProps, "acao">) {
  return (
    <PermissionGuard
      funcionalidade={funcionalidade}
      acao="criar"
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function EditGuard({
  funcionalidade,
  children,
  fallback,
  loadingFallback,
}: Omit<PermissionGuardProps, "acao">) {
  return (
    <PermissionGuard
      funcionalidade={funcionalidade}
      acao="editar"
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function DeleteGuard({
  funcionalidade,
  children,
  fallback,
  loadingFallback,
}: Omit<PermissionGuardProps, "acao">) {
  return (
    <PermissionGuard
      funcionalidade={funcionalidade}
      acao="excluir"
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function ManageGuard({
  funcionalidade,
  children,
  fallback,
  loadingFallback,
}: Omit<PermissionGuardProps, "acao">) {
  return (
    <PermissionGuard
      funcionalidade={funcionalidade}
      acao="gerenciar"
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </PermissionGuard>
  );
}
