"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showQuickJump?: boolean;
  showPageInfo?: boolean;
  pageRangeDisplayed?: number;
  className?: string;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showQuickJump = true,
  showPageInfo = true,
  pageRangeDisplayed = 5,
  className = "",
}: AdvancedPaginationProps) {
  const [jumpPage, setJumpPage] = useState("");

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calcular range de páginas para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= pageRangeDisplayed + 2) {
      // Mostrar todas as páginas se não houver muitas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica mais complexa para páginas com ellipsis
      const leftSiblingIndex = Math.max(currentPage - Math.floor(pageRangeDisplayed / 2), 1);
      const rightSiblingIndex = Math.min(
        currentPage + Math.floor(pageRangeDisplayed / 2),
        totalPages
      );

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      // Sempre mostrar primeira página
      pages.push(1);

      // Mostrar dots à esquerda se necessário
      if (shouldShowLeftDots) {
        pages.push("leftDots");
      }

      // Mostrar páginas do range atual
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Mostrar dots à direita se necessário
      if (shouldShowRightDots) {
        pages.push("rightDots");
      }

      // Sempre mostrar última página
      if (totalPages !== 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(jumpPage);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
        setJumpPage("");
      }
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col items-center justify-between gap-4 sm:flex-row ${className}`}>
      {/* Informações da página */}
      {showPageInfo && (
        <div className="text-muted-foreground text-sm">
          Mostrando {startItem}-{endItem} de {totalItems} resultados
        </div>
      )}

      {/* Controles centrais de navegação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
          title="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Página anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === "leftDots" || pageNumber === "rightDots") {
              return (
                <Button key={index} variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            const isCurrentPage = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(pageNumber as number)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Próxima página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
          title="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Última página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Controles adicionais */}
      <div className="flex items-center gap-4">
        {/* Seletor de itens por página */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              Itens por página:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Jump para página específica */}
        {showQuickJump && totalPages > 10 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm whitespace-nowrap">Ir para:</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={handleQuickJump}
              placeholder="Página"
              className="h-8 w-16"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedPagination;
