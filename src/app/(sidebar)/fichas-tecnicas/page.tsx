"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ChefHat, Users, Clock, Trash2, Edit, Eye, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { TechnicalSheet } from "@/types/technical-sheet";
import { TechnicalSheetService } from "@/lib/services/technicalSheetService";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TechnicalSheetsListPage() {
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const [sheets, setSheets] = useState<TechnicalSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const pageSize = 9; // 3x3 grid

  useEffect(() => {
    loadTechnicalSheets();
  }, [selectedOrganization, page, difficultyFilter]);

  const loadTechnicalSheets = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const result = await TechnicalSheetService.getTechnicalSheetsByOrganization(
        selectedOrganization.id,
        page,
        pageSize
      );

      if (result.success && result.data) {
        let filteredSheets = result.data;

        // Aplicar filtro de dificuldade no frontend
        if (difficultyFilter !== "all") {
          filteredSheets = result.data.filter((sheet) => sheet.difficulty === difficultyFilter);
        }

        setSheets(filteredSheets);
        setTotal(result.total || 0);
      } else {
        toast.error(result.error || "Erro ao carregar fichas técnicas");
      }
    } catch (error) {
      console.error("Erro ao carregar fichas técnicas:", error);
      toast.error("Erro inesperado ao carregar fichas técnicas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const result = await TechnicalSheetService.deleteTechnicalSheet(id);

      if (result.success) {
        toast.success("Ficha técnica removida com sucesso!");
        await loadTechnicalSheets(); // Recarregar a lista
      } else {
        toast.error(result.error || "Erro ao remover ficha técnica");
      }
    } catch (error) {
      console.error("Erro ao remover ficha técnica:", error);
      toast.error("Erro inesperado ao remover ficha técnica");
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "fácil":
        return "bg-green-100 text-green-800";
      case "médio":
        return "bg-yellow-100 text-yellow-800";
      case "difícil":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-muted-foreground mb-2 text-xl font-semibold">
            Acesso não autorizado
          </h2>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedOrganization) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-muted-foreground mb-2 text-xl font-semibold">
            Nenhuma organização selecionada
          </h2>
          <p className="text-muted-foreground">
            Selecione uma organização para ver as fichas técnicas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Fichas Técnicas</h1>
          <p className="text-muted-foreground">
            Gerencie suas fichas técnicas de pratos e receitas.
          </p>
        </div>
        <Link href="/ficha-tecnica">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Ficha Técnica
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="fácil">Fácil</SelectItem>
              <SelectItem value="médio">Médio</SelectItem>
              <SelectItem value="difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-muted-foreground text-sm">{total} fichas técnicas encontradas</div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-gray-200"></div>
                  <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sheets.length === 0 ? (
        <div className="py-12 text-center">
          <ChefHat className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-muted-foreground mb-2 text-lg font-semibold">
            Nenhuma ficha técnica encontrada
          </h3>
          <p className="text-muted-foreground mb-6">
            {difficultyFilter !== "all"
              ? "Não há fichas técnicas com essa dificuldade."
              : "Crie sua primeira ficha técnica para começar."}
          </p>
          <Link href="/ficha-tecnica">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Primeira Ficha
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sheets.map((sheet) => (
              <Card key={sheet.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{sheet.dishName}</CardTitle>
                    <Badge className={getDifficultyColor(sheet.difficulty)}>
                      {sheet.difficulty || "N/A"}
                    </Badge>
                  </div>
                  <CardDescription>Criado em {formatDate(sheet.createdAt)}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span>{sheet.servings} porções</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>{sheet.preparationTime || "N/A"}</span>
                    </div>
                  </div>

                  {/* Ingredientes preview */}
                  <div>
                    <p className="mb-2 text-sm font-medium">Ingredientes:</p>
                    <div className="text-muted-foreground text-xs">
                      {sheet.ingredients.slice(0, 3).map((ing, i) => (
                        <span key={i}>
                          {ing.name}
                          {i < Math.min(sheet.ingredients.length - 1, 2) && ", "}
                        </span>
                      ))}
                      {sheet.ingredients.length > 3 && (
                        <span> e mais {sheet.ingredients.length - 3}...</span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deleting === sheet.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Ficha Técnica</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a ficha técnica "{sheet.dishName}"? Esta
                            ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(sheet.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {total > pageSize && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground px-4 text-sm">
                Página {page} de {Math.ceil(total / pageSize)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
