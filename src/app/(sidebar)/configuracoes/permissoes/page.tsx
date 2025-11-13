"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Functionality, Profile, Permission } from "@/types/models/user";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

export default function PermissoesPage() {
  const { isMaster, loading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [funcionalidades, setFuncionalidades] = useState<Functionality[]>([]);
  const [perfis, setPerfis] = useState<Profile[]>([]);
  const [permissoes, setPermissoes] = useState<Permission[]>([]);
  const [configuracoes, setConfiguracoes] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [funcData, perfisData, permissoesData] = await Promise.all([
        PermissionService.getFuncionalidades(),
        PermissionService.getPerfisUsuario(),
        PermissionService.getPermissoes(),
      ]);

      setFuncionalidades(funcData);
      setPerfis(perfisData);
      setPermissoes(permissoesData);

      // Inicializar configurações
      const config: Record<string, Record<string, boolean>> = {};
      perfisData.forEach((perfil) => {
        config[perfil.id] = {};
        permissoesData.forEach((permissao) => {
          config[perfil.id][
            `${permissao.functionality_id}_${permissao.action}`
          ] = false;
        });
      });

      setConfiguracoes(config);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados de permissões");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissaoChange = (
    perfilId: string,
    funcionalidadeId: string,
    acao: string,
    checked: boolean
  ) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [perfilId]: {
        ...prev[perfilId],
        [`${funcionalidadeId}_${acao}`]: checked,
      },
    }));
  };

  const handleSavePerfil = async (perfilId: string) => {
    try {
      setSaving(true);
      const perfilConfig = configuracoes[perfilId];
      const permissoesAtivas = Object.entries(perfilConfig)
        .filter(([_, ativo]) => ativo)
        .map(([key, _]) => {
          const [funcionalidade_id, acao] = key.split("_");
          return { funcionalidade_id, acao, ativo: true };
        });

      const success = await PermissionService.atualizarPermissoesPerfil(
        perfilId,
        permissoesAtivas
      );

      if (success) {
        toast.success(
          `Permissões do perfil "${
            perfis.find((p) => p.id === perfilId)?.name
          }" atualizadas com sucesso!`
        );
      } else {
        toast.error("Erro ao atualizar permissões");
      }
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      toast.error("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  // Se não for master, mostrar acesso negado
  if (!permissionsLoading && !isMaster) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página. Apenas usuários
              com perfil &quot;Master&quot; podem configurar permissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Entre em contato com um administrador do sistema para solicitar
              acesso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionsLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      funcionalidade="permissoes"
      acao="gerenciar"
      fallback={
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para gerenciar permissões do sistema.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configuração de Permissões</h1>
          <p className="text-muted-foreground">
            Configure as permissões para cada perfil de usuário no sistema
          </p>
        </div>

        <Tabs defaultValue="perfis" className="space-y-6">
          <TabsList>
            <TabsTrigger value="perfis">Perfis de Usuário</TabsTrigger>
            <TabsTrigger value="funcionalidades">Funcionalidades</TabsTrigger>
          </TabsList>

          <TabsContent value="perfis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfis de Usuário</CardTitle>
                <CardDescription>
                  Gerencie as permissões para cada perfil de usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {perfis.map((perfil) => (
                    <div key={perfil.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {perfil.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {perfil.description}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSavePerfil(perfil.id)}
                          disabled={saving}
                          size="sm"
                        >
                          {saving ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {funcionalidades.map((funcionalidade) => (
                          <div key={funcionalidade.id} className="space-y-3">
                            <h4 className="font-medium text-sm">
                              {funcionalidade.name}
                            </h4>
                            <div className="space-y-2">
                              {permissoes
                                .filter(
                                  (p) =>
                                    p.functionality_id === funcionalidade.id
                                )
                                .map((permissao) => (
                                  <div
                                    key={permissao.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${perfil.id}_${permissao.id}`}
                                      checked={
                                        configuracoes[perfil.id]?.[
                                          `${funcionalidade.id}_${permissao.action}`
                                        ] || false
                                      }
                                      onCheckedChange={(checked) =>
                                        handlePermissaoChange(
                                          perfil.id,
                                          funcionalidade.id,
                                          permissao.action,
                                          checked as boolean
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`${perfil.id}_${permissao.id}`}
                                      className="text-sm font-normal"
                                    >
                                      {permissao.action}
                                    </Label>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funcionalidades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades do Sistema</CardTitle>
                <CardDescription>
                  Lista de todas as funcionalidades disponíveis para
                  configuração de permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {funcionalidades.map((funcionalidade) => (
                    <div
                      key={funcionalidade.id}
                      className="border rounded-lg p-4"
                    >
                      <h3 className="font-semibold mb-2">
                        {funcionalidade.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {funcionalidade.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {funcionalidade.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {funcionalidade.route}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
