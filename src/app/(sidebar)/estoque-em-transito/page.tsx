"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CalendarRange,
  Clock3,
  FilterX,
  PackageOpen,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";
import { StockInTransitResponseDto } from "@/types/dto/stock-in-transit/response";
import { StockInTransitService } from "@/lib/services/client/stock-in-transit-service";
import { ReadGuard } from "@/components/auth/PermissionGuard";

const FETCH_LIMIT = 500;
const MOBILE_PAGE_SIZE = 20;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

type ExpiryBucket =
  | "expired"
  | "today"
  | "critical"
  | "warning"
  | "healthy"
  | "missing";

type ExpiryFilter = "all" | ExpiryBucket;

type ExpiryMeta = {
  bucket: ExpiryBucket;
  label: string;
  helperText: string;
  daysUntil: number | null;
  sortOrder: number;
};

type StockInTransitTableRow = StockInTransitResponseDto & {
  expiryMeta: ExpiryMeta;
};

function parseCalendarDate(value: string | Date | null): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const dateOnly = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getExpiryMeta(expiryDate: string | null): ExpiryMeta {
  const parsedDate = parseCalendarDate(expiryDate);

  if (!parsedDate) {
    return {
      bucket: "missing",
      label: "Sem validade",
      helperText: "Data nao informada",
      daysUntil: null,
      sortOrder: 5,
    };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (parsedDate.getTime() - startOfToday.getTime()) / MS_PER_DAY,
  );

  if (diffDays < 0) {
    return {
      bucket: "expired",
      label: "Vencido",
      helperText: `Ha ${Math.abs(diffDays)} dia(s)`,
      daysUntil: diffDays,
      sortOrder: 0,
    };
  }

  if (diffDays === 0) {
    return {
      bucket: "today",
      label: "Vence hoje",
      helperText: "Acao imediata",
      daysUntil: diffDays,
      sortOrder: 1,
    };
  }

  if (diffDays <= 3) {
    return {
      bucket: "critical",
      label: "Prox. de vencer",
      helperText: `${diffDays} dia(s) restantes`,
      daysUntil: diffDays,
      sortOrder: 2,
    };
  }

  if (diffDays <= 7) {
    return {
      bucket: "warning",
      label: "Acompanhar",
      helperText: `${diffDays} dia(s) restantes`,
      daysUntil: diffDays,
      sortOrder: 3,
    };
  }

  return {
    bucket: "healthy",
    label: "Dentro do prazo",
    helperText: `${diffDays} dia(s) restantes`,
    daysUntil: diffDays,
    sortOrder: 4,
  };
}

function getExpiryBadgeClass(bucket: ExpiryBucket): string {
  switch (bucket) {
    case "expired":
      return "border-red-200 bg-red-50 text-red-700";
    case "today":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "critical":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "healthy":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "missing":
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getExpiryCardClass(bucket: ExpiryBucket): string {
  switch (bucket) {
    case "expired":
      return "border-l-4 border-l-red-500";
    case "today":
      return "border-l-4 border-l-orange-500";
    case "critical":
      return "border-l-4 border-l-amber-500";
    case "warning":
      return "border-l-4 border-l-yellow-500";
    case "healthy":
      return "border-l-4 border-l-emerald-500";
    case "missing":
    default:
      return "border-l-4 border-l-slate-300";
  }
}

function matchesExpiryFilter(
  row: StockInTransitTableRow,
  filter: ExpiryFilter,
): boolean {
  if (filter === "all") return true;
  return row.expiryMeta.bucket === filter;
}

function matchesMobileSearch(
  row: StockInTransitTableRow,
  searchTerm: string,
): boolean {
  if (!searchTerm.trim()) return true;

  const normalizedSearch = searchTerm.toLowerCase();
  const haystack = [
    row.product?.name,
    row.observations,
    row.unitOfMeasureCode,
    row.expiryMeta.label,
    row.expiryMeta.helperText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

function ExpirySummaryCard({
  title,
  value,
  description,
  icon,
  className,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="flex items-start justify-between p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-full bg-white/70 p-2 shadow-sm">{icon}</div>
      </CardContent>
    </Card>
  );
}

function MobileStockCard({
  row,
  onDiscard,
  formatDate,
  formatDateTime,
  formatQuantity,
}: {
  row: StockInTransitTableRow;
  onDiscard: (id: string) => void;
  formatDate: (value: string | Date | null) => string;
  formatDateTime: (value: string | Date | null) => string;
  formatQuantity: (value: number) => string;
}) {
  return (
    <Card className={getExpiryCardClass(row.expiryMeta.bucket)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-semibold text-slate-900">
              {row.product?.name || "N/A"}
            </p>
            <p className="text-sm text-slate-500">
              {formatQuantity(row.quantity)} {row.unitOfMeasureCode}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ${getExpiryBadgeClass(row.expiryMeta.bucket)}`}
          >
            {row.expiryMeta.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Validade
            </p>
            <p className="font-medium text-slate-700">
              {formatDate(row.expiryDate)}
            </p>
            <p className="text-xs text-slate-500">{row.expiryMeta.helperText}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Fabricacao
            </p>
            <p className="font-medium text-slate-700">
              {formatDate(row.manufacturingDate)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Criado em
            </p>
            <p className="font-medium text-slate-700">
              {formatDateTime(row.createdAt)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Observacoes
            </p>
            <p className="line-clamp-2 text-sm text-slate-600">
              {row.observations || "-"}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2"
          onClick={() => onDiscard(row.id)}
        >
          <Trash2 className="h-4 w-4" />
          Descartar
        </Button>
      </CardContent>
    </Card>
  );
}

export const EstoqueEmTransitoIcon = () => {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAEAEA]">
      <PackageOpen className="h-10 w-10 text-[#D68910]" strokeWidth={1.5} />
    </div>
  );
};

export default function EstoqueEmTransitoPage() {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || "";

  const [data, setData] = useState<StockInTransitResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [discardId, setDiscardId] = useState<string | null>(null);
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [mobileVisibleCount, setMobileVisibleCount] =
    useState(MOBILE_PAGE_SIZE);

  const carregarDados = async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const response = await StockInTransitService.list({
        page: 1,
        pageSize: FETCH_LIMIT,
        organizationId,
      });
      setData(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar estoque em transito:", error);
      toast.error("Erro ao carregar dados do estoque em transito");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      carregarDados();
    }
  }, [organizationId]);

  useEffect(() => {
    setMobileVisibleCount(MOBILE_PAGE_SIZE);
  }, [expiryFilter, mobileSearchTerm]);

  const handleDiscard = async () => {
    if (!discardId) return;

    try {
      await StockInTransitService.discard(discardId, organizationId);
      toast.success("Item descartado com sucesso!");
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao descartar item:", error);
      toast.error(error?.response?.data?.error || "Erro ao descartar o item");
    } finally {
      setDiscardId(null);
    }
  };

  const formatarQuantidade = (quantidade: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(quantidade);
  };

  const formatarData = (value: string | Date | null) => {
    const date = parseCalendarDate(value);
    if (!date) return "-";

    try {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatarDataHora = (value: string | Date | null) => {
    if (!value) return "-";

    try {
      const date = typeof value === "string" ? new Date(value) : value;
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const rows = useMemo<StockInTransitTableRow[]>(() => {
    return [...data]
      .map((row) => ({
        ...row,
        expiryMeta: getExpiryMeta(row.expiryDate),
      }))
      .sort((a, b) => {
        if (a.expiryMeta.sortOrder !== b.expiryMeta.sortOrder) {
          return a.expiryMeta.sortOrder - b.expiryMeta.sortOrder;
        }

        const aDate =
          parseCalendarDate(a.expiryDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDate =
          parseCalendarDate(b.expiryDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;

        if (aDate !== bDate) {
          return aDate - bDate;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [data]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesExpiryFilter(row, expiryFilter)),
    [rows, expiryFilter],
  );

  const mobileRows = useMemo(
    () =>
      filteredRows.filter((row) => matchesMobileSearch(row, mobileSearchTerm)),
    [filteredRows, mobileSearchTerm],
  );

  const visibleMobileRows = useMemo(
    () => mobileRows.slice(0, mobileVisibleCount),
    [mobileRows, mobileVisibleCount],
  );

  const hasMoreMobileRows = mobileRows.length > mobileVisibleCount;

  const expirySummary = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.total += 1;
          acc[row.expiryMeta.bucket] += 1;
          return acc;
        },
        {
          total: 0,
          expired: 0,
          today: 0,
          critical: 0,
          warning: 0,
          healthy: 0,
          missing: 0,
        },
      ),
    [rows],
  );

  const urgentCount =
    expirySummary.expired +
    expirySummary.today +
    expirySummary.critical +
    expirySummary.warning;

  const filterOptions: Array<{
    value: ExpiryFilter;
    label: string;
    count: number;
  }> = [
    { value: "all", label: "Todos", count: expirySummary.total },
    { value: "expired", label: "Vencidos", count: expirySummary.expired },
    { value: "today", label: "Vence hoje", count: expirySummary.today },
    { value: "critical", label: "1-3 dias", count: expirySummary.critical },
    { value: "warning", label: "4-7 dias", count: expirySummary.warning },
    { value: "missing", label: "Sem validade", count: expirySummary.missing },
  ];

  const columns: GenericTableColumn<StockInTransitTableRow>[] = [
    {
      id: "product_name",
      key: "product.name",
      label: "Produto",
      accessor: (row) => row.product?.name || "N/A",
      visible: true,
      width: 250,
    },
    {
      id: "quantity",
      key: "quantity",
      label: "Quantidade",
      accessor: (row) => row.quantity,
      visible: true,
      render: (value, row) => (
        <div className="font-mono">
          {formatarQuantidade(value as number)} {row.unitOfMeasureCode}
        </div>
      ),
    },
    {
      id: "manufacturingDate",
      key: "manufacturingDate",
      label: "Data fabricacao",
      accessor: (row) => row.manufacturingDate,
      visible: true,
      render: (value) => <div>{formatarData(value as string)}</div>,
    },
    {
      id: "expiryDate",
      key: "expiryDate",
      label: "Data validade",
      accessor: (row) => row.expiryDate,
      visible: true,
      render: (value, row) => (
        <div className="space-y-1">
          <div>{formatarData(value as string)}</div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={getExpiryBadgeClass(row.expiryMeta.bucket)}
            >
              {row.expiryMeta.label}
            </Badge>
            <span className="text-xs text-slate-500">
              {row.expiryMeta.helperText}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "observations",
      key: "observations",
      label: "Observacoes",
      accessor: (row) => row.observations || "-",
      visible: true,
    },
    {
      id: "createdAt",
      key: "createdAt",
      label: "Criado em",
      accessor: (row) => row.createdAt,
      visible: true,
      render: (value) => <div>{formatarDataHora(value as string)}</div>,
    },
    {
      id: "actions",
      key: "id",
      label: "Acoes",
      accessor: (row) => row.id,
      visible: true,
      width: 100,
      render: (value) => (
        <div className="flex justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDiscardId(value as string)}
            className="flex h-8 items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Descarte
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ReadGuard module="STOCK">
      <div className="flex-1 space-y-6">
        <AlertDialog
          open={!!discardId}
          onOpenChange={(open) => !open && setDiscardId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar descarte</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja descartar este item? Ele sera removido do
                estoque em transito e gerara um registro de saida no estoque.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDiscard}
              >
                Descartar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <EstoqueEmTransitoIcon />
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Estoque em Transito
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Visualize os produtos retirados do estoque e acompanhe o que
                precisa de acao primeiro.
              </p>
            </div>
          </div>
          <Button asChild className="gap-2 self-start sm:self-auto">
            <Link href="/estoque/transito">
              <Printer className="h-4 w-4" />
              Imprimir etiqueta
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <ExpirySummaryCard
            title="Itens em transito"
            value={expirySummary.total}
            description="Base completa carregada"
            icon={<PackageOpen className="h-5 w-5 text-slate-600" />}
          />
          <ExpirySummaryCard
            title="Vencidos"
            value={expirySummary.expired}
            description="Exigem descarte ou revisao"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            className="border-red-200 bg-red-50/60"
          />
          <ExpirySummaryCard
            title="Vence hoje"
            value={expirySummary.today}
            description="Acao imediata"
            icon={<CalendarClock className="h-5 w-5 text-orange-600" />}
            className="border-orange-200 bg-orange-50/60"
          />
          <ExpirySummaryCard
            title="Prox. 3 dias"
            value={expirySummary.critical}
            description="Itens criticos"
            icon={<Clock3 className="h-5 w-5 text-amber-600" />}
            className="border-amber-200 bg-amber-50/60"
          />
          <ExpirySummaryCard
            title="4 a 7 dias"
            value={expirySummary.warning}
            description="Acompanhar de perto"
            icon={<CalendarRange className="h-5 w-5 text-yellow-600" />}
            className="border-yellow-200 bg-yellow-50/60"
          />
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Filtros rapidos de vencimento
                </p>
                <p className="text-xs text-slate-500">
                  Destaque itens mais urgentes sem depender so da busca textual.
                </p>
              </div>
              {urgentCount > 0 && (
                <Badge
                  variant="outline"
                  className="w-fit border-amber-200 bg-amber-50 text-amber-700"
                >
                  {urgentCount} item(ns) exigem atencao
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={expiryFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiryFilter(option.value)}
                  className="gap-2"
                >
                  {option.label}
                  <Badge
                    variant="secondary"
                    className="bg-white/80 text-slate-700"
                  >
                    {option.count}
                  </Badge>
                </Button>
              ))}

              {expiryFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpiryFilter("all")}
                  className="gap-2 text-slate-500"
                >
                  <FilterX className="h-4 w-4" />
                  Limpar filtro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:hidden">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Busca rapida no mobile
                </p>
                <p className="text-xs text-slate-500">
                  Encontre produto, observacao ou status sem depender da tabela.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={mobileSearchTerm}
                  onChange={(event) => setMobileSearchTerm(event.target.value)}
                  placeholder="Buscar no estoque em transito..."
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-slate-500">
                Carregando itens...
              </CardContent>
            </Card>
          ) : visibleMobileRows.length === 0 ? (
            <Card>
              <CardContent className="space-y-1 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Nenhum item encontrado
                </p>
                <p className="text-xs text-slate-500">
                  Ajuste os filtros ou a busca para localizar outros itens.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {visibleMobileRows.map((row) => (
                  <MobileStockCard
                    key={row.id}
                    row={row}
                    onDiscard={setDiscardId}
                    formatDate={formatarData}
                    formatDateTime={formatarDataHora}
                    formatQuantity={formatarQuantidade}
                  />
                ))}
              </div>

              {hasMoreMobileRows && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setMobileVisibleCount((current) => current + MOBILE_PAGE_SIZE)
                  }
                >
                  Mostrar mais {Math.min(MOBILE_PAGE_SIZE, mobileRows.length - mobileVisibleCount)} item(ns)
                </Button>
              )}
            </>
          )}
        </div>

        <div className="hidden md:block">
          <GenericTable<StockInTransitTableRow>
            title="Produtos em Transito"
            description="Relacao de produtos em transicao, ordenados por urgencia de vencimento"
            columns={columns}
            data={filteredRows}
            loading={loading}
            searchable={true}
            searchPlaceholder="Buscar produto..."
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showAdvancedPagination={true}
          />
        </div>
      </div>
    </ReadGuard>
  );
}
