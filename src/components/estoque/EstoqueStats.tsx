"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  BarChart3 
} from "lucide-react";
import { EstoqueEstatisticas } from "@/types/estoque";

interface EstoqueStatsProps {
  estatisticas?: EstoqueEstatisticas | null;
  carregando?: boolean;
}

export function EstoqueStats({ estatisticas, carregando }: EstoqueStatsProps) {
  if (carregando || !estatisticas) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-16" />
              </div>
              <p className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-20 mt-1" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Produtos",
      value: estatisticas.total_produtos,
      description: "Produtos cadastrados",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Em Estoque",
      value: estatisticas.produtos_em_estoque,
      description: "Com quantidade > 0",
      icon: BarChart3,
      color: "text-green-600",
    },
    {
      title: "Estoque Zerado",
      value: estatisticas.produtos_zerados,
      description: "Sem produtos disponíveis",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Estoque Baixo",
      value: estatisticas.produtos_baixo_estoque,
      description: "Precisam de reposição",
      icon: TrendingUp,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              
              {/* Badge de status para alguns cards */}
              {index === 2 && card.value > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Atenção necessária
                </Badge>
              )}
              {index === 3 && card.value > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Reposição sugerida
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}