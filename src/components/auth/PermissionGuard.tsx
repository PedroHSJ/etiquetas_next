"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { FunctionalityCodeType } from "@/types/models/functionality";

interface PermissionGuardProps {
  funcionalidade: string;
  acao: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

interface CodePermissionGuardProps {
  code: FunctionalityCodeType | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Guard baseado em código de funcionalidade (recomendado)
 * Usa o novo sistema de permissões com códigos como 'STOCK:READ', 'MEMBERS:WRITE'
 */
export function CodePermissionGuard({
  code,
  children,
  fallback,
  loadingFallback,
}: CodePermissionGuardProps) {
  const { hasPermissionByCode, loading } = usePermissions();

  if (loading) {
    return loadingFallback ? <>{loadingFallback}</> : null;
  }

  if (!hasPermissionByCode(code)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center p-4 text-center">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-red-600">
            Acesso Negado
          </div>
          <div className="text-sm text-muted-foreground">
            Você não tem permissão para acessar esta funcionalidade.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Guard de leitura para um módulo
 * @example <ReadGuard module="STOCK">...</ReadGuard>
 */
export function ReadGuard({
  module,
  children,
  fallback,
  loadingFallback,
}: {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <CodePermissionGuard
      code={`${module}:READ`}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </CodePermissionGuard>
  );
}

/**
 * Guard de escrita para um módulo
 * @example <WriteGuard module="STOCK">...</WriteGuard>
 */
export function WriteGuard({
  module,
  children,
  fallback,
  loadingFallback,
}: {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <CodePermissionGuard
      code={`${module}:WRITE`}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </CodePermissionGuard>
  );
}

// ========== LEGACY GUARDS (mantidos para compatibilidade) ==========

/**
 * @deprecated Use CodePermissionGuard ou ReadGuard/WriteGuard
 */
export function PermissionGuard({
  funcionalidade,
  acao,
  children,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return null;
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
