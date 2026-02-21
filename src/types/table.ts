export interface Column {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  fixed?: boolean;
  width?: number;
}

export interface GenericTableColumn<T = unknown> extends Column {
  accessor: string | ((row: T) => unknown);
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface TableConfig {
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  showPagination?: boolean;
  showColumnSelector?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}
