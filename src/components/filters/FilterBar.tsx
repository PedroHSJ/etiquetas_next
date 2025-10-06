import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';

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
  searchPlaceholder = 'Buscar...',
  showDepartmentFilter = true,
  onClearFilters,
  loading = false,
  onSearch,
  onFilter,
  placeholder = 'Buscar...',
  className = '',
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState(searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSearchTerm) {
      setSearchTerm(searchQuery);
    }
    onSearch?.(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (setSearchTerm) {
      setSearchTerm('');
    }
    onSearch?.('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filt.</span>
          </Button>
        </div>
      </form>

      {/* Área de filtros */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Filtros</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Todos</option>
                <option value="empresa">Empresa</option>
                <option value="organizacao">Organização</option>
              </select>
            </div>
            
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-2">Data</label>
              <Input type="date" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
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
