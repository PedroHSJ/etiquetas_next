"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrganizationDetails } from "@/components/organization";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Building2,
  Users,
  Package,
  ChefHat,
  BarChart3,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { activeOrganizationDetails, detailsLoading } = useOrganization();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao seu sistema de gestão de UAN</p>
      </div>

      {/* Informações da Organização Ativa */}
      {detailsLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Carregando informações da organização...
              </span>
            </div>
          </CardContent>
        </Card>
      ) : activeOrganizationDetails ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organização Ativa
            </CardTitle>
            <CardDescription>Informações da organização atualmente selecionada</CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationDetails
              organization={activeOrganizationDetails}
              variant="compact"
              showAllDetails={false}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building2 className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">Nenhuma organização selecionada</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeOrganizationDetails?.capacidade_atendimento || "--"}
            </div>
            <p className="text-muted-foreground text-xs">refeições/dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telefone</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {activeOrganizationDetails?.telefone_principal || "--"}
            </div>
            <p className="text-muted-foreground text-xs">Contato principal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Localização</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {activeOrganizationDetails?.cidade && activeOrganizationDetails?.estado
                ? `${activeOrganizationDetails.cidade}/${activeOrganizationDetails.estado}`
                : "--"}
            </div>
            <p className="text-muted-foreground text-xs">Cidade/Estado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CNPJ</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{activeOrganizationDetails?.cnpj || "--"}</div>
            <p className="text-muted-foreground text-xs">Identificação</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Configurações
            </CardTitle>
            <CardDescription>Gerencie informações da organização</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/configuracoes">
              <Button className="w-full">
                Abrir Configurações
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Etiquetas
            </CardTitle>
            <CardDescription>Gerencie etiquetas de alimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/etiquetas">
              <Button variant="outline" className="w-full">
                Ver Etiquetas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros
            </CardTitle>
            <CardDescription>Gerencie membros da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/members">
              <Button variant="outline" className="w-full">
                Ver Membros
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
