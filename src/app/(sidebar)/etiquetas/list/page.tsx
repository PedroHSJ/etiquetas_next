"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/ui/navigation-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FilterBar from "@/components/filters/FilterBar";
import Pagination from "@/components/pagination/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

interface Etiqueta {
  id: number;
  produto_id: number;
  quantidade: number;
  data_impressao: string;
  usuario_id: string;
  organizacao_id: string;
  status: string;
  observacoes: string;
  created_at: string;
  produto?: { nome: string };
}

export default function Page() {
  const { userId } = useAuth();
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [filteredEtiquetas, setFilteredEtiquetas] = useState<Etiqueta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Buscar etiquetas
  const fetchEtiquetas = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from("etiquetas")
      .select("*, product:products(name)")
      .order("created_at", { ascending: false });
    // Filtro por usuário logado (opcional)
    // if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query;
    if (!error && data) {
      setEtiquetas(data);
      setFilteredEtiquetas(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEtiquetas();
  }, [fetchEtiquetas]);

  // Filtro por termo de busca
  useEffect(() => {
    let filtered = etiquetas;
    if (searchTerm) {
      filtered = filtered.filter(
        (etq) =>
          // etq.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etq.produto?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etq.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          etq.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEtiquetas(filtered);
    setCurrentPage(1);
  }, [etiquetas, searchTerm]);

  // Paginação
  const totalItems = filteredEtiquetas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEtiquetas = filteredEtiquetas.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const clearFilters = () => {
    setSearchTerm("");
  };

  return (
    <Suspense fallback={<div>Carregando etiquetas...</div>}>
      <div className="flex flex-1 flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lista de etiquetas</h1>
            <p className="text-muted-foreground">Visualize todas as etiquetas geradas</p>
          </div>
        </div>

        {/* Filtros */}
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Produto, status, observações..."
          showDepartmentFilter={false}
          onClearFilters={clearFilters}
          loading={loading}
        />

        {/* Lista/Tabela de Etiquetas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Etiquetas ({totalItems})</CardTitle>
            <CardDescription>
              {loading
                ? "Carregando..."
                : totalPages > 1
                  ? `Mostrando ${startIndex + 1}-${Math.min(
                      endIndex,
                      totalItems
                    )} de ${totalItems} etiquetas`
                  : `${totalItems} etiqueta(s) encontrada(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">
                <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground mt-2">Carregando etiquetas...</p>
              </div>
            ) : totalItems === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                {searchTerm
                  ? "Nenhuma etiqueta encontrada com os filtros aplicados"
                  : "Nenhuma etiqueta cadastrada"}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visualização em Cards para mobile */}
                <div className="block space-y-4 md:hidden">
                  {paginatedEtiquetas.map((etq) => (
                    <Card key={etq.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-emerald-100 text-emerald-600">
                              {getInitials(etq.product?.name || etq.produto?.nome || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {etq.product?.name || etq.produto?.nome || "Produto desconhecido"}
                            </h3>
                            <p className="text-muted-foreground text-xs">Status: {etq.status}</p>
                            <p className="text-muted-foreground text-xs">Qtd: {etq.quantidade}</p>
                            <p className="text-muted-foreground text-xs">
                              Impressa em:{" "}
                              {format(new Date(etq.data_impressao), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        {etq.observacoes && (
                          <div className="text-muted-foreground mt-2 text-xs">
                            Obs: {etq.observacoes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Visualização em Tabela para desktop */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Impressa em</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEtiquetas.map((etq) => (
                        <TableRow key={etq.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-emerald-100 text-xs text-emerald-600">
                                  {getInitials(etq.product?.name || etq.produto?.nome || "?")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {etq.product?.name || etq.produto?.nome || "Produto desconhecido"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {etq.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{etq.quantidade}</TableCell>
                          <TableCell>
                            {format(new Date(etq.data_impressao), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{etq.observacoes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
