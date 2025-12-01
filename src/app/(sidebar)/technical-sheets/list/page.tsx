"use client";

import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavigationButton } from "@/components/ui/navigation-button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { TechnicalSheet } from "@/types/technical-sheet";
import { TechnicalSheetService } from "@/lib/services/client/technical-sheet-service";
import {
  ChefHat,
  Clock,
  Edit,
  Eye,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const pageSize = 9; // 3x3 grid

  useEffect(() => {
    loadTechnicalSheets();
  }, [selectedOrganization, page, difficultyFilter]);

  const loadTechnicalSheets = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const result = await TechnicalSheetService.list({
        organizationId: selectedOrganization.id,
        page,
        pageSize,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
      });

      let filteredSheets = result.data;

      if (difficultyFilter !== "all") {
        filteredSheets = result.data.filter(
          (sheet) => sheet.difficulty === difficultyFilter
        );
      }

      const activeSheets = filteredSheets.filter(
        (sheet) => sheet.active !== false
      );

      setSheets(activeSheets);
      setTotal(activeSheets.length);
    } catch (error) {
      console.error("Erro ao carregar fichas técnicas:", error);
      toast.error("Erro inesperado ao carregar fichas técnicas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedOrganization) return;

    setDeleting(id);
    try {
      await TechnicalSheetService.remove(id, selectedOrganization.id);
      toast.success("Ficha técnica removida com sucesso!");
      await loadTechnicalSheets();
    } catch (error) {
      console.error("Erro ao remover ficha técnica:", error);
      toast.error("Erro inesperado ao remover ficha técnica");
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty?: string | null) => {
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
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
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fichas Técnicas</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todas as suas fichas técnicas
            </p>
          </div>
        </div>
        <NavigationButton href="/technical-sheets/create">
          <Plus className="mr-2 h-4 w-4" />
          Nova ficha técnica
        </NavigationButton>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
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
        <div className="text-sm text-muted-foreground">
          {total} fichas técnicas encontradas
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Grade
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>
      </div>

      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : sheets.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Nenhuma ficha técnica encontrada
          </h3>
          <p className="text-muted-foreground mb-6">
            {difficultyFilter !== "all"
              ? "Não há fichas técnicas com essa dificuldade."
              : "Crie sua primeira ficha técnica para começar."}
          </p>
          <Link href="/technical-sheets/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Ficha
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {sheet.dishName}
                      </CardTitle>
                      <Badge className={getDifficultyColor(sheet.difficulty)}>
                        {sheet.difficulty || "N/A"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Criado em {formatDate(sheet.createdAt)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{sheet.servings} porções</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{sheet.preparationTime || "N/A"}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Ingredientes:</p>
                      <div className="text-xs text-muted-foreground">
                        {sheet.ingredients.slice(0, 3).map((ing, i) => (
                          <span key={i}>
                            {ing.name}
                            {i < Math.min(sheet.ingredients.length - 1, 2) &&
                              ", "}
                          </span>
                        ))}
                        {sheet.ingredients.length > 3 && (
                          <span> e mais {sheet.ingredients.length - 3}...</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Link
                        href={`/technical-sheets/edit/${sheet.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
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
                            <AlertDialogTitle>
                              Remover Ficha Técnica
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover a ficha técnica{" "}
                              {sheet.dishName}? Esta ação não pode ser desfeita.
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
          ) : (
            <div className="space-y-4">
              {sheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className="hover:shadow-sm transition"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 py-3">
                    <div>
                      <CardTitle className="text-base">
                        {sheet.dishName}
                      </CardTitle>
                      <CardDescription>
                        Criado em {formatDate(sheet.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(sheet.difficulty)}>
                      {sheet.difficulty || "N/A"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 py-3">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{sheet.servings} porções</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{sheet.preparationTime || "N/A"}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Ingredientes:</p>
                      <div className="text-xs text-muted-foreground">
                        {sheet.ingredients.slice(0, 3).map((ing, i) => (
                          <span key={i}>
                            {ing.name}
                            {i < Math.min(sheet.ingredients.length - 1, 2) &&
                              ", "}
                          </span>
                        ))}
                        {sheet.ingredients.length > 3 && (
                          <span> e mais {sheet.ingredients.length - 3}...</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Link href={`/technical-sheets/edit/${sheet.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
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
                            <AlertDialogTitle>
                              Remover Ficha Técnica
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover a ficha técnica{" "}
                              {sheet.dishName}? Esta ação não pode ser desfeita.
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
          )}

          {total > pageSize && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-4">
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
