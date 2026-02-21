"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { StockStatistics } from "@/types/stock/stock";

interface EstoqueStatsProps {
  stats?: StockStatistics | null;
  carregando?: boolean;
}

export function EstoqueStats({ stats, carregando }: EstoqueStatsProps) {
  if (carregando || !stats) {
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
              <div className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Produtos",
      value: stats.totalProducts,
      description: "Produtos cadastrados",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Em Estoque",
      value: stats.productsInStock,
      description: "Com quantidade > 0",
      icon: BarChart3,
      color: "text-green-600",
    },
    {
      title: "Estoque Zerado",
      value: stats.productsOutOfStock,
      description: "Sem produtos disponíveis",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Estoque Baixo",
      value: stats.productsLowStock,
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
                {card.value.toLocaleString("pt-BR")}
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
