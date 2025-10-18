"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PermissionGuard,
  ViewGuard,
  CreateGuard,
  EditGuard,
  DeleteGuard,
  ManageGuard,
} from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Eye, Plus, Edit, Trash2, Settings, Shield, CheckCircle, XCircle } from "lucide-react";

export function PermissionExample() {
  const { temPermissao, isMaster } = usePermissions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status das Permissões
          </CardTitle>
          <CardDescription>Verifique suas permissões atuais no sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Nível de Acesso</h4>
              <Badge variant="outline" className="px-3 py-1 text-lg">
                {isMaster() ? "Master" : "Usuário"}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Usuário Master</h4>
              <div className="flex items-center gap-2">
                {isMaster() ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={isMaster() ? "text-green-600" : "text-red-600"}>
                  {isMaster() ? "Sim" : "Não"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Permissões por Funcionalidade</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {["dashboard", "produtos", "etiquetas", "departamentos", "usuarios"].map(
                (funcionalidade) => (
                  <div key={funcionalidade} className="rounded-lg border p-3">
                    <h5 className="mb-2 font-medium capitalize">{funcionalidade}</h5>
                    <div className="space-y-1">
                      {["visualizar", "criar", "editar", "excluir", "gerenciar"].map((acao) => {
                        const temPerm = temPermissao(funcionalidade, acao);
                        return (
                          <div key={acao} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{acao}</span>
                            <Badge variant={temPerm ? "default" : "secondary"} className="text-xs">
                              {temPerm ? "Sim" : "Não"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Exemplo de proteção de rota */}
        <Card>
          <CardHeader>
            <CardTitle>Proteção de Rotas</CardTitle>
            <CardDescription>Componentes que só aparecem com permissão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ViewGuard funcionalidade="dashboard">
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Você pode visualizar o dashboard</span>
              </div>
            </ViewGuard>

            <CreateGuard funcionalidade="produtos">
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Plus className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">Você pode criar produtos</span>
              </div>
            </CreateGuard>

            <EditGuard funcionalidade="etiquetas">
              <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <Edit className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Você pode editar etiquetas</span>
              </div>
            </EditGuard>

            <DeleteGuard funcionalidade="usuarios">
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">Você pode excluir usuários</span>
              </div>
            </DeleteGuard>

            <ManageGuard funcionalidade="departamentos">
              <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
                <Settings className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-800">Você pode gerenciar departamentos</span>
              </div>
            </ManageGuard>
          </CardContent>
        </Card>

        {/* Exemplo de botões condicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Botões Condicionais</CardTitle>
            <CardDescription>Botões que aparecem baseado em permissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ViewGuard funcionalidade="dashboard">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Dashboard
              </Button>
            </ViewGuard>

            <CreateGuard funcionalidade="produtos">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </CreateGuard>

            <EditGuard funcionalidade="etiquetas">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                Editar Etiquetas
              </Button>
            </EditGuard>

            <DeleteGuard funcionalidade="usuarios">
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Usuário
              </Button>
            </DeleteGuard>

            <ManageGuard funcionalidade="departamentos">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Departamentos
              </Button>
            </ManageGuard>
          </CardContent>
        </Card>
      </div>

      {/* Exemplo de fallback customizado */}
      <Card>
        <CardHeader>
          <CardTitle>Fallback Customizado</CardTitle>
          <CardDescription>Mensagens personalizadas quando não há permissão</CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionGuard
            funcionalidade="relatorios"
            acao="visualizar"
            fallback={
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                <Shield className="mx-auto mb-3 h-12 w-12 text-amber-600" />
                <h3 className="mb-2 text-lg font-medium text-amber-800">
                  Relatórios Indisponíveis
                </h3>
                <p className="text-amber-700">
                  Entre em contato com o administrador para solicitar acesso aos relatórios.
                </p>
              </div>
            }
          >
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <h3 className="mb-2 text-lg font-medium text-green-800">Relatórios Disponíveis</h3>
              <p className="text-green-700">Você tem acesso completo aos relatórios do sistema.</p>
            </div>
          </PermissionGuard>
        </CardContent>
      </Card>
    </div>
  );
}
