import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnSelector, Column } from './column-selector'
import { AdvancedPagination } from './advanced-pagination'
import { Search, MoreHorizontal, Trash2, Download, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface BulkAction {
  label: string
  icon?: React.ReactNode
  onClick: (selectedRows: (string | number)[]) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export interface GenericTableColumn<T = unknown> extends Column {
  accessor: string | ((row: T) => unknown)
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

interface GenericTableProps<T = Record<string, unknown>> {
  title?: string
  description?: string
  columns: GenericTableColumn<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  itemsPerPage?: number
  showPagination?: boolean
  showAdvancedPagination?: boolean
  showItemsPerPageSelector?: boolean
  showQuickJump?: boolean
  onItemsPerPageChange?: (itemsPerPage: number) => void
  selectable?: boolean
  selectedRows?: Set<string | number>
  onSelectionChange?: (selectedRows: Set<string | number>) => void
  getRowId?: (row: T, index: number) => string | number
  bulkActions?: BulkAction[] | React.ReactNode
  onRowClick?: (row: T, index: number) => void
  rowActions?: (row: T, index: number) => React.ReactNode
  className?: string
}

export function GenericTable<T extends Record<string, unknown>>({
  title,
  description,
  columns: initialColumns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = "Pesquisar...",
  itemsPerPage: initialItemsPerPage = 10,
  showPagination = true,
  showAdvancedPagination = true,
  showItemsPerPageSelector = true,
  showQuickJump = true,
  onItemsPerPageChange,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (row, index) => {
    if (typeof row === 'object' && row !== null) {
      return (row as { id?: string | number }).id
        || (row as { key?: string | number }).key
        || (row as { _id?: string | number })._id
        || (row as { uuid?: string | number }).uuid
        || (row as { codigo?: string | number }).codigo
        || (row as { codigo_ibge?: string | number }).codigo_ibge
        || (row as { email?: string | number }).email
        || (row as { nome?: string | number }).nome
        || index;
    }
    return index;
  },
  bulkActions,
  onRowClick,
  rowActions,
  className,
}: GenericTableProps<T>) {
  const [columns, setColumns] = useState<GenericTableColumn<T>[]>(initialColumns)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  // Filtrar colunas visíveis e ordená-las
  const visibleColumns = useMemo(() => {
    return columns
      .filter(col => col.visible)
      .sort((a, b) => {
        // Colunas fixas primeiro
        if (a.fixed && !b.fixed) return -1
        if (!a.fixed && b.fixed) return 1
        return 0
      })
  }, [columns])

  // Filtrar dados baseado na pesquisa
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data

    return data.filter(row => {
      return visibleColumns.some(column => {
        let value: unknown
        if (typeof column.accessor === 'function') {
          value = column.accessor(row)
        } else {
          value = row[column.accessor]
        }
        
        if (value == null) return false
        
        return String(value)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      })
    })
  }, [data, searchTerm, visibleColumns])

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = showPagination 
    ? filteredData.slice(startIndex, endIndex)
    : filteredData

  const handleColumnsChange = (updatedColumns: Column[]) => {
    const newColumns = updatedColumns.map(updatedCol => {
      const existingCol = columns.find(col => col.id === updatedCol.id)
      return existingCol ? { ...existingCol, ...updatedCol } : updatedCol
    }) as GenericTableColumn[]
    
    setColumns(newColumns)
  }

  const getCellValue = (row: T, column: GenericTableColumn<T>, index: number) => {
    let value: unknown
    if (typeof column.accessor === 'function') {
      value = column.accessor(row)
    } else {
      value = (row as Record<string, unknown>)[column.accessor]
    }

    if (column.render) {
      return column.render(value, row, index)
    }

    return value
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset para primeira página
    onItemsPerPageChange?.(newItemsPerPage)
  }

  // Handlers de seleção
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      const allRowIds = new Set(paginatedData.map((row, index) => getRowId(row, startIndex + index)))
      onSelectionChange(allRowIds)
    } else {
      onSelectionChange(new Set())
    }
  }

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return
    
    const newSelection = new Set(selectedRows)
    if (checked) {
      newSelection.add(rowId)
    } else {
      newSelection.delete(rowId)
    }
    onSelectionChange(newSelection)
  }

  // Estados de seleção
  const isAllSelected = selectable && paginatedData.length > 0 && paginatedData.every((row, index) => 
    selectedRows.has(getRowId(row, startIndex + index))
  )
  
  const isIndeterminate = selectable && selectedRows.size > 0 && !isAllSelected
  const hasSelectedRows = selectedRows.size > 0

  return (
    <Card className={`${className} min-h-[500px] flex flex-col`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className="flex-1 flex flex-col">
        {/* Barra de ferramentas */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            {searchable && (
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset para primeira página ao pesquisar
                  }}
                  className="pl-10"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ColumnSelector
              columns={columns}
              onColumnsChange={handleColumnsChange}
            />
          </div>
        </div>

        {/* Barra de ações em lote */}
        {selectable && hasSelectedRows && bulkActions && (
          <div className="flex items-center justify-between bg-muted p-3 rounded-md mb-4">
            <span className="text-sm text-muted-foreground">
              {selectedRows.size} item(s) selecionado(s)
            </span>
            <div className="flex gap-2">
              {Array.isArray(bulkActions) ? (
                bulkActions.map((action: BulkAction, index: number) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => action.onClick(Array.from(selectedRows))}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))
              ) : (
                bulkActions
              )}
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className={isIndeterminate ? 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground [&>svg]:opacity-50' : ''}
                      aria-label="Selecionar todas as linhas"
                    />
                  </TableHead>
                )}
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.id}
                    style={{ width: column.width ? `${column.width}px` : 'auto' }}
                    className={column.fixed ? 'bg-muted/30' : ''}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {rowActions && (
                  <TableHead className="w-[50px]">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Carregando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum dado disponível'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row, startIndex + index)
                  const isSelected = selectedRows.has(rowId)
                  
                  return (
                    <TableRow 
                      key={index}
                      className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${isSelected ? 'bg-muted/20' : ''}`}
                      onClick={() => onRowClick?.(row, startIndex + index)}
                    >
                      {selectable && (
                        <TableCell 
                          className="w-[50px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleSelectRow(rowId, checked as boolean)
                            }
                            aria-label={`Selecionar linha ${index + 1}`}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => (
                        <TableCell 
                          key={column.id}
                          className={column.fixed ? 'bg-muted/10' : ''}
                        >
                          {getCellValue(row, column, startIndex + index) as React.ReactNode}
                        </TableCell>
                      ))}
                      {rowActions && (
                        <TableCell>
                          <div onClick={(e) => e.stopPropagation()}>
                            {rowActions(row, startIndex + index)}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {showPagination && totalPages > 1 && (
          showAdvancedPagination ? (
            <AdvancedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={showItemsPerPageSelector ? handleItemsPerPageChange : undefined}
              showItemsPerPage={showItemsPerPageSelector}
              showQuickJump={showQuickJump}
              className="mt-4"
            />
          ) : (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} resultados
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  ←
                </Button>
                
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  →
                </Button>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}