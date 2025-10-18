import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";

interface FilterBarProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  selectedOrganization?: string;
  setSelectedOrganization?: (org: string) => void;
  selectedDepartment?: string;
  setSelectedDepartment?: (dept: string) => void;
  organizations?: Organization[];
  departments?: Department[];
  searchPlaceholder?: string;
  showDepartmentFilter?: boolean;
  onClearFilters?: () => void;
  loading?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterOptions) => void;
  placeholder?: string;
  className?: string;
}

interface Organization {
  id: string;
  nome: string;
}

interface Department {
  id: string;
  nome: string;
}

interface FilterOptions {
  organization?: string;
  department?: string;
  search?: string;
}

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedOrganization,
  setSelectedOrganization,
  selectedDepartment,
  setSelectedDepartment,
  organizations = [],
  departments = [],
  searchPlaceholder = "Buscar...",
  showDepartmentFilter = true,
  onClearFilters,
  loading = false,
  onSearch,
  onFilter,
  placeholder = "Buscar...",
  className = "",
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState(searchTerm || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSearchTerm) {
      setSearchTerm(searchQuery);
    }
    onSearch?.(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (setSearchTerm) {
      setSearchTerm("");
    }
    onSearch?.("");
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder={searchPlaceholder || placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1 sm:flex-none">
            Buscar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFilters}
            className="flex-1 sm:flex-none"
          >
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filt.</span>
          </Button>
        </div>
      </form>

      {/* Área de filtros */}
      {showFilters && (
        <div className="bg-muted/50 rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Filtros</h3>
            <Button variant="ghost" size="sm" onClick={toggleFilters}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select className="w-full rounded-md border p-2">
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Tipo</label>
              <select className="w-full rounded-md border p-2">
                <option value="">Todos</option>
                <option value="empresa">Empresa</option>
                <option value="organizacao">Organização</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <label className="mb-2 block text-sm font-medium">Data</label>
              <Input type="date" />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button size="sm" onClick={() => onFilter?.({})} className="flex-1 sm:flex-none">
              Aplicar Filtros
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
