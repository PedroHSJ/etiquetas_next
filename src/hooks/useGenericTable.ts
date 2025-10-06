"use client";

import { useState, useMemo, useCallback } from 'react'
import { GenericTableColumn } from '@/types/table'

interface UseGenericTableProps<T> {
  initialColumns: GenericTableColumn<T>[]
  data: T[]
  itemsPerPage?: number
}

export function useGenericTable<T extends Record<string, unknown>>({
  initialColumns,
  data,
  itemsPerPage = 10,
}: UseGenericTableProps<T>) {
  const [columns, setColumns] = useState<GenericTableColumn<T>[]>(initialColumns)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrar colunas visíveis
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
  const paginationInfo = useMemo(() => {
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
    }
  }, [filteredData.length, itemsPerPage, currentPage])

  const paginatedData = useMemo(() => {
    const { startIndex, endIndex } = paginationInfo
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, paginationInfo])

  // Handlers
  const handleColumnsChange = useCallback((updatedColumns: GenericTableColumn[]) => {
    setColumns(updatedColumns)
  }, [])

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search)
    setCurrentPage(1) // Reset para primeira página ao pesquisar
  }, [])

  const handlePageChange = useCallback((page: number) => {
    const { totalPages } = paginationInfo
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [paginationInfo])

  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  return {
    // Estado
    columns,
    visibleColumns,
    searchTerm,
    currentPage,
    
    // Dados processados
    filteredData,
    paginatedData,
    paginationInfo,
    
    // Handlers
    handleColumnsChange,
    handleSearchChange,
    handlePageChange,
    resetFilters,
    
    // Utilidades
    isEmpty: paginatedData.length === 0,
    hasResults: filteredData.length > 0,
    isFiltered: searchTerm.trim().length > 0,
  }
}