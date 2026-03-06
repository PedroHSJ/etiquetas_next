"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ChevronLeft,
  Printer,
  Save,
  AlertCircle,
  FlaskConical,
  ShoppingBasket,
  Snowflake,
  Thermometer,
  Sun,
  Check,
  PlusCircle,
  Search,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProductService } from "@/lib/services/client/product-service";
import { StockInTransitService } from "@/lib/services/client/stock-in-transit-service";
import { LabelPrinterService } from "@/lib/services/client/label-printer-service";
import { StockService } from "@/lib/services/client/stock-service";
import {
  ProductResponseDto as Product,
  ProductGroupResponseDto as ProductGroup,
} from "@/types/dto/product/response";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MemberResponseDto as Member } from "@/types/dto/member/response";
import { MemberService } from "@/lib/services/client/member-service";
import { SettingsService } from "@/lib/services/client/settings-service";
import { OrganizationService } from "@/lib/services/client/organization-service";
import { OrganizationExpandedResponseDto } from "@/types/dto/organization/response";
import {
  DevicesService,
  PrinterInfo,
} from "@/lib/services/client/devices-service";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIT_OF_MEASURE_OPTIONS } from "@/types/stock/product";

type ConservationMode = "REFRIGERADO" | "CONGELADO" | "AMBIENTE";
type LabelTab = "opened_product" | "sample" | "thawing" | "manipulated";

type OrganizationPrintContext = {
  organizationName?: string;
  organizationCnpj?: string;
  organizationZipCode?: string;
  organizationAddress?: string;
  organizationNumber?: string;
  organizationAddressComplement?: string;
  organizationCity?: string;
  organizationState?: string;
};

function formatConservationModeLabel(mode: ConservationMode): string {
  return mode === "AMBIENTE" ? "T° AMBIENTE" : mode;
}

// ─────────────────────────────────────────────────
// Reusable sub‑components
// ─────────────────────────────────────────────────
function GroupChip({
  group,
  isSelected,
  onSelect,
}: {
  group: ProductGroup;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(group.id.toString())}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-150 overflow-hidden",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm active:bg-slate-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-medium text-xs leading-tight text-wrap",
            isSelected ? "text-primary" : "text-slate-700",
          )}
        >
          {group.name}
        </span>
        {isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

function ProductCard({
  product,
  isSelected,
  onSelect,
}: {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product.id.toString())}
      className={cn(
        "relative w-full p-3.5 rounded-xl border-2 text-left transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm active:bg-slate-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-medium text-xs leading-tight",
            isSelected ? "text-primary" : "text-slate-700",
          )}
        >
          {product.name}
        </span>
        {isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

function ConservationOption({
  mode,
  label,
  icon,
  isSelected,
  onSelect,
}: {
  mode: ConservationMode;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (mode: ConservationMode) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[11px] font-medium text-center leading-tight",
          isSelected ? "text-primary" : "text-slate-500",
        )}
      >
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────
// Shared: Product picker section used by both tabs
// ─────────────────────────────────────────────────
function ProductPickerSection({
  groups,
  products,
  loading,
  selectedGroupId,
  selectedProductId,
  groupFilter,
  productFilter,
  onGroupSelect,
  onProductSelect,
  onGroupFilterChange,
  onProductFilterChange,
  onCreateProduct,
  filterByGroup,
  onFilterByGroupChange,
}: {
  groups: ProductGroup[];
  products: Product[];
  loading: boolean;
  selectedGroupId: string;
  selectedProductId: string;
  groupFilter: string;
  productFilter: string;
  onGroupSelect: (id: string) => void;
  onProductSelect: (id: string) => void;
  onGroupFilterChange: (v: string) => void;
  onProductFilterChange: (v: string) => void;
  onCreateProduct: (name: string) => void;
  filterByGroup: boolean;
  onFilterByGroupChange: (v: boolean) => void;
}) {
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupFilter.toLowerCase()),
  );
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productFilter.toLowerCase()),
  );

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-slate-600">
          Produto
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Label
            htmlFor="filter-by-group"
            className="text-sm font-medium cursor-pointer"
          >
            Filtrar por Grupo
          </Label>
          <div className="scale-75 origin-right">
            <Switch
              id="filter-by-group"
              checked={filterByGroup}
              onCheckedChange={onFilterByGroupChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* ── Groups: vertical grid ── */}
        {filterByGroup && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Grupo
            </p>
            {groups.length > 8 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filtrar grupos..."
                  value={groupFilter}
                  onChange={(e) => onGroupFilterChange(e.target.value)}
                  className="h-9 pl-9 text-sm"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
              {filteredGroups.length === 0 && !loading ? (
                <p className="text-sm text-slate-400 py-2 col-span-2 text-center">
                  Nenhum grupo encontrado
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <GroupChip
                    key={group.id}
                    group={group}
                    isSelected={selectedGroupId === group.id.toString()}
                    onSelect={onGroupSelect}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Products grid ── */}
        {(!filterByGroup || selectedGroupId) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Produto
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar produto..."
                value={productFilter}
                onChange={(e) => onProductFilterChange(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
            {loading ? (
              <p className="text-center text-slate-400 py-4 text-sm">
                Carregando...
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center p-5 bg-slate-50 border border-dashed rounded-xl">
                <p className="text-sm text-slate-500 mb-3 text-center">
                  <strong>&quot;{productFilter || "..."}&quot;</strong> não
                  encontrado.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCreateProduct(productFilter || "Novo Produto")
                  }
                  disabled={loading}
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Cadastrar e selecionar
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProductId === product.id.toString()}
                    onSelect={onProductSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────
// Unit of Measure selector
// ─────────────────────────────────────────────────
function UnitOfMeasureField({
  stockUnit,
  value,
  onChange,
  quantity,
  onQuantityChange,
}: {
  stockUnit: string | null; // null = no stock → user picks
  value: string;
  onChange: (v: string) => void;
  quantity: number;
  onQuantityChange: (v: number) => void;
}) {
  const unitLocked = !!stockUnit;

  return (
    <div className="space-y-2">
      <Label>
        Quantidade <span className="text-destructive">*</span>
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          type="number"
          min="0.001"
          step="0.001"
          className="h-12 flex-1"
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
        />
        {unitLocked ? (
          <div className="flex h-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500 min-w-[60px]">
            {stockUnit}
          </div>
        ) : (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-full w-full">
              <SelectValue placeholder="un" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OF_MEASURE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
function parseIntegerInput(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLocalDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildLocalDateTimeWithOffset(
  dateValue: string,
  hours: number,
  minutes: number,
): string {
  const baseDate = parseDateInputValue(dateValue) ?? new Date();
  const localDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );

  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absoluteOffset / 60)
    .toString()
    .padStart(2, "0");
  const offsetRemainder = (absoluteOffset % 60).toString().padStart(2, "0");

  const year = localDate.getFullYear();
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const day = localDate.getDate().toString().padStart(2, "0");
  const hour = localDate.getHours().toString().padStart(2, "0");
  const minute = localDate.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:00${sign}${offsetHours}:${offsetRemainder}`;
}

function formatDateTimeForLabel(dateTimeValue: string): string {
  const match = dateTimeValue.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (!match) return dateTimeValue;

  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function formatDateInputForLabel(dateValue: string): string {
  const date = parseDateInputValue(dateValue);
  if (!date) return dateValue;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getLocalTimeInputValue(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addHoursToLocalDateTime(
  dateValue: string,
  timeValue: string,
  hoursToAdd: number,
): { date: string; time: string } {
  const baseDate = parseDateInputValue(dateValue) ?? new Date();
  const [hours, minutes] = timeValue.split(":").map(Number);
  const adjustedDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );
  adjustedDate.setHours(adjustedDate.getHours() + hoursToAdd);

  return {
    date: getLocalDateInputValue(adjustedDate),
    time: getLocalTimeInputValue(adjustedDate),
  };
}

function getMemberDisplayName(member: Member): string {
  return member.users?.name || member.user?.name || member.id;
}

function LabelCopiesField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Quantidade de etiquetas</Label>
      <Input
        id={id}
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        className="h-12"
        value={value}
        onChange={(e) => onChange(parseIntegerInput(e.target.value))}
        onBlur={() => {
          if (value <= 0) onChange(1);
        }}
      />
      <p className="text-xs text-slate-400">
        Usado apenas ao clicar em Imprimir. Nao altera a quantidade do estoque.
      </p>
    </div>
  );
}

// Main page
// ─────────────────────────────────────────────────
export default function EstoqueTransitoPage() {
  const router = useRouter();
  const { activeProfile } = useProfile();
  const { activeOrganizationDetails } = useOrganization();
  const { user } = useAuth();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || "";
  const organizationName =
    activeOrganizationDetails?.name ||
    activeProfile?.userOrganization?.organization?.name ||
    "";
  const organizationCnpj =
    activeOrganizationDetails?.cnpj ||
    activeProfile?.userOrganization?.organization?.cnpj ||
    "";
  const organizationZipCode =
    activeOrganizationDetails?.zipCode ||
    activeProfile?.userOrganization?.organization?.zipCode ||
    "";
  const organizationAddress =
    activeOrganizationDetails?.address ||
    activeProfile?.userOrganization?.organization?.address ||
    "";
  const organizationNumber =
    activeOrganizationDetails?.number ||
    activeProfile?.userOrganization?.organization?.number ||
    "";
  const organizationAddressComplement =
    activeOrganizationDetails?.addressComplement ||
    activeProfile?.userOrganization?.organization?.addressComplement ||
    "";
  const organizationCity = activeOrganizationDetails?.city?.name || "";
  const organizationState = activeOrganizationDetails?.state?.code || "";
  const isGestor =
    activeProfile?.profile?.name?.toLowerCase().includes("gestor") || false;
  const initialDate = getLocalDateInputValue();
  const initialTime = getLocalTimeInputValue();
  const initialSampleDiscard = addHoursToLocalDateTime(
    initialDate,
    initialTime,
    72,
  );

  const [activeTab, setActiveTab] = useState<LabelTab>("opened_product");

  // Data
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selection (shared)
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // Stock info (null = not checked yet, { quantity: 0 } = no stock)
  const [stockInfo, setStockInfo] = useState<{
    quantity: number;
    unit: string;
  } | null>(null);

  // The effective unit
  const effectiveUnit =
    stockInfo && stockInfo.quantity > 0 ? stockInfo.unit : null;
  const selectedProduct = products.find(
    (product) => product.id.toString() === selectedProductId,
  );
  const selectedProductName = selectedProduct?.name || "";

  // ====== SAMPLES state ======
  const [sampleName, setSampleName] = useState("");
  const [sampleCollectionDate, setSampleCollectionDate] =
    useState(initialDate);
  const [sampleCollectionTime, setSampleCollectionTime] =
    useState(initialTime);
  const [sampleDiscardDate, setSampleDiscardDate] = useState(
    initialSampleDiscard.date,
  );
  const [sampleDiscardTime, setSampleDiscardTime] = useState(
    initialSampleDiscard.time,
  );
  const [sampleShift, setSampleShift] = useState("");
  const [sampleResponsible, setSampleResponsible] = useState("");
  const [sampleQuantity, setSampleQuantity] = useState<number>(100);
  const [sampleCustomUnit, setSampleCustomUnit] = useState("g");
  const [sampleLabelCopies, setSampleLabelCopies] = useState<number>(1);

  // ====== OPENED PRODUCT state ======
  const [openedAtDate, setOpenedAtDate] = useState(initialDate);
  const [openedAtTime, setOpenedAtTime] = useState(initialTime);
  const [openedOriginalValidityDate, setOpenedOriginalValidityDate] =
    useState("");
  const [openedValidityDate, setOpenedValidityDate] = useState("");
  const [openedValidityTime, setOpenedValidityTime] = useState(initialTime);
  const [openedConservationMode, setOpenedConservationMode] =
    useState<ConservationMode>("REFRIGERADO");
  const [openedResponsible, setOpenedResponsible] = useState("");
  const [openedQuantity, setOpenedQuantity] = useState<number>(1);
  const [openedCustomUnit, setOpenedCustomUnit] = useState("un");
  const [openedLabelCopies, setOpenedLabelCopies] = useState<number>(1);

  // ====== THAWING state ======
  const [thawingStartDate, setThawingStartDate] = useState(initialDate);
  const [thawingStartTime, setThawingStartTime] = useState(initialTime);
  const [thawingValidityDate, setThawingValidityDate] = useState("");
  const [thawingValidityTime, setThawingValidityTime] = useState(initialTime);
  const [thawingLot, setThawingLot] = useState("");
  const [thawingResponsible, setThawingResponsible] = useState("");
  const [thawingQuantity, setThawingQuantity] = useState<number>(1);
  const [thawingCustomUnit, setThawingCustomUnit] = useState("un");
  const [thawingLabelCopies, setThawingLabelCopies] = useState<number>(1);

  // ====== MANIPULATED state ======
  const [manipulatedPreparationName, setManipulatedPreparationName] =
    useState("");
  const [manipulatedAtDate, setManipulatedAtDate] = useState(initialDate);
  const [manipulatedAtTime, setManipulatedAtTime] = useState(initialTime);
  const [manipulatedValidityDate, setManipulatedValidityDate] = useState("");
  const [manipulatedValidityTime, setManipulatedValidityTime] =
    useState(initialTime);
  const [manipulatedConservationMode, setManipulatedConservationMode] =
    useState<ConservationMode>("REFRIGERADO");
  const [manipulatedResponsible, setManipulatedResponsible] = useState("");
  const [manipulatedQuantity, setManipulatedQuantity] = useState<number>(1);
  const [manipulatedCustomUnit, setManipulatedCustomUnit] = useState("un");
  const [manipulatedLabelCopies, setManipulatedLabelCopies] =
    useState<number>(1);
  const [filterByGroup, setFilterByGroup] = useState(false);

  // ────── Queries ──────
  const { data: members = [] } = useQuery<Member[], Error>({
    queryKey: ["members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return MemberService.listByOrganization(organizationId);
    },
    enabled: !!organizationId,
  });

  // Printer Polling
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  useEffect(() => {
    if (organizationId) {
      const loadPrinters = async () => {
        setLoadingPrinters(true);
        try {
          const data = await DevicesService.getConnectedPrinters();
          setPrinters(data);
          if (data.length > 0 && !selectedPrinter) {
            setSelectedPrinter(data[0].printerName);
          }
        } catch (e) {
          console.error("Error loading printers", e);
        } finally {
          setLoadingPrinters(false);
        }
      };
      loadPrinters();
      // Optional: Polling every 15s to keep printer list fresh
      const interval = setInterval(loadPrinters, 15000);
      return () => clearInterval(interval);
    }
  }, [organizationId, selectedPrinter]);

  // Settings
  const { data: defaultPrinterName } = useQuery({
    queryKey: ["printer-name", organizationId],
    queryFn: () => SettingsService.getPrinterName(organizationId),
    enabled: !!organizationId,
  });

  // ────── Effects ──────
  useEffect(() => {
    const nextDiscard = addHoursToLocalDateTime(
      sampleCollectionDate,
      sampleCollectionTime,
      72,
    );
    setSampleDiscardDate(nextDiscard.date);
    setSampleDiscardTime(nextDiscard.time);
  }, [sampleCollectionDate, sampleCollectionTime]);

  useEffect(() => {
    if (organizationId) loadGroups();
  }, [organizationId]);

  useEffect(() => {
    if ((selectedGroupId || !filterByGroup) && organizationId) {
      loadProducts(filterByGroup ? selectedGroupId : undefined);
    } else {
      setProducts([]);
      setSelectedProductId("");
    }
  }, [selectedGroupId, filterByGroup, organizationId]);

  useEffect(() => {
    if (selectedProductId && organizationId) {
      checkStock(selectedProductId);
    } else {
      setStockInfo(null);
    }
  }, [selectedProductId, organizationId]);

  useEffect(() => {
    // Set default responsible to current logged-in user
    if (user?.name) {
      if (!sampleResponsible || !isGestor) {
        setSampleResponsible(user.name);
      }
      if (!openedResponsible || !isGestor) {
        setOpenedResponsible(user.name);
      }
      if (!thawingResponsible || !isGestor) {
        setThawingResponsible(user.name);
      }
      if (!manipulatedResponsible || !isGestor) {
        setManipulatedResponsible(user.name);
      }
    }
  }, [
    user?.name,
    isGestor,
    sampleResponsible,
    openedResponsible,
    thawingResponsible,
    manipulatedResponsible,
  ]);

  useEffect(() => {
    if (
      defaultPrinterName &&
      !selectedPrinter &&
      printers.some((printer) => printer.printerName === defaultPrinterName)
    ) {
      setSelectedPrinter(defaultPrinterName);
    }
  }, [defaultPrinterName, printers, selectedPrinter]);

  // ────── Loaders ──────
  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getGroups(organizationId);
      setGroups(data);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("Erro ao carregar grupos");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (groupId?: string) => {
    try {
      setLoading(true);
      const all = await ProductService.getProducts(organizationId);
      if (groupId) {
        setProducts(all.filter((p) => p.groupId === parseInt(groupId)));
      } else {
        setProducts(all);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const checkStock = async (productId: string) => {
    try {
      const stock = await StockService.listStock({
        page: 1,
        pageSize: 1,
        organizationId,
        productId: parseInt(productId),
      });
      if (stock.data && stock.data.length > 0) {
        setStockInfo({
          quantity: stock.data[0].currentQuantity,
          unit: stock.data[0].unitOfMeasureCode,
        });
      } else {
        setStockInfo({ quantity: 0, unit: "un" });
      }
    } catch {
      setStockInfo(null);
    }
  };

  // ────── Handlers ──────
  const handleGroupSelect = (id: string) => {
    setSelectedGroupId(id === selectedGroupId ? "" : id);
    setSelectedProductId("");
    setProductFilter("");
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id === selectedProductId ? "" : id);
  };

  const handleCreateProduct = async (name: string) => {
    if (!name.trim() || !organizationId || !selectedGroupId) return;
    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          groupId: parseInt(selectedGroupId),
          organizationId,
        }),
      });
      if (!res.ok) throw new Error("Erro via API");
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      setSelectedProductId(newProduct.id.toString());
      setProductFilter("");
      toast.success("Produto cadastrado!");
    } catch {
      toast.error("Erro ao cadastrar produto");
    } finally {
      setLoading(false);
    }
  };

  // ────── Validation ──────
  const validateSampleForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return false;
    }
    if (!sampleName.trim()) {
      toast.error("Preencha o nome da amostra");
      return false;
    }
    if (sampleQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return false;
    }
    if (!sampleCollectionDate || !sampleCollectionTime) {
      toast.error("Preencha a data e hora da coleta");
      return false;
    }
    if (!sampleDiscardDate || !sampleDiscardTime) {
      toast.error("Preencha a data e hora do descarte");
      return false;
    }
    if (!sampleResponsible.trim()) {
      toast.error("Selecione o responsável");
      return false;
    }
    return true;
  };

  const validateLabelCopies = (copies: number): boolean => {
    if (!Number.isInteger(copies) || copies <= 0) {
      toast.error("A quantidade de etiquetas deve ser maior que zero");
      return false;
    }

    return true;
  };

  const formatLabelCopies = (copies: number) =>
    copies === 1 ? "1 etiqueta" : `${copies} etiquetas`;

  const formatPrintSuccessMessage = (copies: number, printerName: string) =>
    `${formatLabelCopies(copies)} enviada${copies === 1 ? "" : "s"} para ${printerName}!`;

  // ────── Save ──────
  const resolveUnit = (fallbackUnit: string) =>
    stockInfo && stockInfo.quantity > 0 ? stockInfo.unit : fallbackUnit;

  const buildLocalDateTimeFromInputs = (
    dateValue: string,
    timeValue: string,
  ): string => {
    const [hoursText = "0", minutesText = "0"] = timeValue.split(":");
    const hours = Number.parseInt(hoursText, 10);
    const minutes = Number.parseInt(minutesText, 10);

    return buildLocalDateTimeWithOffset(
      dateValue,
      Number.isFinite(hours) ? hours : 0,
      Number.isFinite(minutes) ? minutes : 0,
    );
  };

  const buildObservation = (parts: Array<string | undefined>): string =>
    parts.filter((part): part is string => Boolean(part?.trim())).join(" | ");

  const resolveOrganizationPrintContext =
    async (): Promise<OrganizationPrintContext> => {
      const shouldRefetchOrganization =
        !!organizationId &&
        (!activeOrganizationDetails ||
          !activeOrganizationDetails.cnpj ||
          !activeOrganizationDetails.zipCode ||
          !activeOrganizationDetails.address ||
          !activeOrganizationDetails.city ||
          !activeOrganizationDetails.state);

      let expandedOrganization: OrganizationExpandedResponseDto | null = null;

      if (shouldRefetchOrganization) {
        try {
          expandedOrganization =
            await OrganizationService.getOrganizationByIdExpanded(
              organizationId,
            );
        } catch (error) {
          console.warn(
            "Falha ao recarregar detalhes da organizacao para etiqueta",
            error,
          );
        }
      }

      return {
        organizationName:
          expandedOrganization?.name ||
          activeOrganizationDetails?.name ||
          organizationName,
        organizationCnpj:
          expandedOrganization?.cnpj ||
          activeOrganizationDetails?.cnpj ||
          organizationCnpj,
        organizationZipCode:
          expandedOrganization?.zipCode ||
          activeOrganizationDetails?.zipCode ||
          organizationZipCode,
        organizationAddress:
          expandedOrganization?.address ||
          activeOrganizationDetails?.address ||
          organizationAddress,
        organizationNumber:
          expandedOrganization?.number ||
          activeOrganizationDetails?.number ||
          organizationNumber,
        organizationAddressComplement:
          expandedOrganization?.addressComplement ||
          activeOrganizationDetails?.addressComplement ||
          organizationAddressComplement,
        organizationCity:
          expandedOrganization?.city?.name ||
          activeOrganizationDetails?.city?.name ||
          organizationCity,
        organizationState:
          expandedOrganization?.state?.code ||
          activeOrganizationDetails?.state?.code ||
          organizationState,
      };
    };

  const buildPrinterName = () =>
    selectedPrinter || defaultPrinterName || "LABEL PRINTER";

  const handleSaveSample = async (print: boolean = false) => {
    if (!validateSampleForm()) return;
    try {
      setSaving(true);
      const collectionAt = buildLocalDateTimeFromInputs(
        sampleCollectionDate,
        sampleCollectionTime,
      );
      const discardAt = buildLocalDateTimeFromInputs(
        sampleDiscardDate,
        sampleDiscardTime,
      );
      const unit = sampleCustomUnit;

      if (print) {
        if (!validateLabelCopies(sampleLabelCopies)) return;

        const finalPrinter = buildPrinterName();
        const organizationContext = await resolveOrganizationPrintContext();
        const printed = await LabelPrinterService.printSampleLabel(
          {
            ...organizationContext,
            sampleName: sampleName.trim(),
            collectionAt,
            discardAt,
            shift: sampleShift.trim() || undefined,
            responsibleName: sampleResponsible,
            quantity: sampleQuantity,
            unit,
          },
          finalPrinter,
          organizationId,
          sampleLabelCopies,
        );

        if (!printed) {
          toast.error(
            "Falha ao imprimir. O registro nao foi salvo no estoque em transito.",
          );
          return;
        }

        toast.success(
          formatPrintSuccessMessage(sampleLabelCopies, finalPrinter),
        );
      }

      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: sampleQuantity,
        unitOfMeasureCode: unit,
        manufacturingDate: collectionAt,
        expiryDate: discardAt,
        observations: buildObservation([
          "AMOSTRA",
          `Preparacao: ${sampleName.trim()}`,
          `Coleta: ${formatDateTimeForLabel(collectionAt)}`,
          `Descarte: ${formatDateTimeForLabel(discardAt)}`,
          sampleShift.trim() ? `Turno: ${sampleShift.trim()}` : undefined,
          `Responsavel: ${sampleResponsible}`,
        ]),
        organizationId,
      });
      toast.success("Amostra registrada no estoque em transito!");

      router.push("/estoque-em-transito");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProduct = async (print: boolean = false) => {
    if (!validateOpenedProductForm()) return;
    try {
      setSaving(true);
      const openedAt = buildLocalDateTimeFromInputs(
        openedAtDate,
        openedAtTime,
      );
      const validityDate = buildLocalDateTimeFromInputs(
        openedValidityDate,
        openedValidityTime,
      );
      const originalValidityLabel = formatDateInputForLabel(
        openedOriginalValidityDate,
      );
      const openedLabel = formatDateTimeForLabel(openedAt);
      const validityLabel = formatDateTimeForLabel(validityDate);
      const unit = resolveUnit(openedCustomUnit);

      if (print) {
        if (!validateLabelCopies(openedLabelCopies)) return;

        const finalPrinter = buildPrinterName();
        const organizationContext = await resolveOrganizationPrintContext();
        const printed = await LabelPrinterService.printOpenedProductLabel(
          {
            ...organizationContext,
            productName: selectedProductName || "Produto",
            openedAt,
            originalValidityDate: openedOriginalValidityDate,
            validityDate,
            conservationMode: openedConservationMode,
            responsibleName: openedResponsible,
            quantity: openedQuantity,
            unit,
          },
          finalPrinter,
          organizationId,
          openedLabelCopies,
        );

        if (!printed) {
          toast.error(
            "Falha ao imprimir. O registro nao foi salvo no estoque em transito.",
          );
          return;
        }

        toast.success(
          formatPrintSuccessMessage(openedLabelCopies, finalPrinter),
        );
      }

      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: openedQuantity,
        unitOfMeasureCode: unit,
        manufacturingDate: openedAt,
        expiryDate: validityDate,
        observations: buildObservation([
          "PRODUTO ABERTO",
          `Aberto: ${openedLabel}`,
          `Validade original: ${originalValidityLabel}`,
          `Validade: ${validityLabel}`,
          `Conservacao: ${formatConservationModeLabel(openedConservationMode)}`,
          `Responsavel: ${openedResponsible}`,
        ]),
        organizationId,
      });
      toast.success("Produto aberto registrado no estoque em transito!");

      router.push("/estoque-em-transito");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveThawing = async (print: boolean = false) => {
    if (!validateThawingForm()) return;
    try {
      setSaving(true);
      const startAt = buildLocalDateTimeFromInputs(
        thawingStartDate,
        thawingStartTime,
      );
      const validityDate = buildLocalDateTimeFromInputs(
        thawingValidityDate,
        thawingValidityTime,
      );
      const unit = resolveUnit(thawingCustomUnit);

      if (print) {
        if (!validateLabelCopies(thawingLabelCopies)) return;

        const finalPrinter = buildPrinterName();
        const organizationContext = await resolveOrganizationPrintContext();
        const printed = await LabelPrinterService.printThawingLabel(
          {
            ...organizationContext,
            productName: selectedProductName || "Produto",
            startAt,
            validityDate,
            responsibleName: thawingResponsible,
            quantity: thawingQuantity,
            unit,
            lot: thawingLot.trim() || undefined,
          },
          finalPrinter,
          organizationId,
          thawingLabelCopies,
        );

        if (!printed) {
          toast.error(
            "Falha ao imprimir. O registro nao foi salvo no estoque em transito.",
          );
          return;
        }

        toast.success(
          formatPrintSuccessMessage(thawingLabelCopies, finalPrinter),
        );
      }

      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: thawingQuantity,
        unitOfMeasureCode: unit,
        manufacturingDate: startAt,
        expiryDate: validityDate,
        observations: buildObservation([
          "DESCONGELO",
          `Inicio: ${formatDateTimeForLabel(startAt)}`,
          `Fim: ${formatDateTimeForLabel(validityDate)}`,
          thawingLot.trim() ? `Lote: ${thawingLot.trim()}` : undefined,
          `Responsavel: ${thawingResponsible}`,
        ]),
        organizationId,
      });
      toast.success("Descongelo registrado no estoque em transito!");

      router.push("/estoque-em-transito");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManipulated = async (print: boolean = false) => {
    if (!validateManipulatedForm()) return;
    try {
      setSaving(true);
      const handledAt = buildLocalDateTimeFromInputs(
        manipulatedAtDate,
        manipulatedAtTime,
      );
      const validityDate = buildLocalDateTimeFromInputs(
        manipulatedValidityDate,
        manipulatedValidityTime,
      );
      const unit = resolveUnit(manipulatedCustomUnit);

      if (print) {
        if (!validateLabelCopies(manipulatedLabelCopies)) return;

        const finalPrinter = buildPrinterName();
        const organizationContext = await resolveOrganizationPrintContext();
        const printed = await LabelPrinterService.printManipulatedLabel(
          {
            ...organizationContext,
            preparationName: manipulatedPreparationName.trim(),
            handledAt,
            validityDate,
            conservationMode: manipulatedConservationMode,
            responsibleName: manipulatedResponsible,
            quantity: manipulatedQuantity,
            unit,
          },
          finalPrinter,
          organizationId,
          manipulatedLabelCopies,
        );

        if (!printed) {
          toast.error(
            "Falha ao imprimir. O registro nao foi salvo no estoque em transito.",
          );
          return;
        }

        toast.success(
          formatPrintSuccessMessage(manipulatedLabelCopies, finalPrinter),
        );
      }

      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: manipulatedQuantity,
        unitOfMeasureCode: unit,
        manufacturingDate: handledAt,
        expiryDate: validityDate,
        observations: buildObservation([
          "MANIPULADO",
          `Preparacao: ${manipulatedPreparationName.trim()}`,
          `Fabricacao: ${formatDateTimeForLabel(handledAt)}`,
          `Validade: ${formatDateTimeForLabel(validityDate)}`,
          `Conservacao: ${formatConservationModeLabel(manipulatedConservationMode)}`,
          `Responsavel: ${manipulatedResponsible}`,
        ]),
        organizationId,
      });
      toast.success("Manipulado registrado no estoque em transito!");

      router.push("/estoque-em-transito");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (print: boolean) => {
    switch (activeTab) {
      case "sample":
        handleSaveSample(print);
        return;
      case "opened_product":
        handleSaveProduct(print);
        return;
      case "thawing":
        handleSaveThawing(print);
        return;
      case "manipulated":
        handleSaveManipulated(print);
        return;
    }
  };

  const validateOpenedProductForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return false;
    }
    if (openedQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return false;
    }
    if (!openedAtDate || !openedAtTime) {
      toast.error("Preencha a data e hora de abertura");
      return false;
    }
    if (!openedOriginalValidityDate) {
      toast.error("Preencha a validade original");
      return false;
    }
    if (!openedValidityDate || !openedValidityTime) {
      toast.error("Preencha a data e hora da validade");
      return false;
    }
    if (!openedResponsible.trim()) {
      toast.error("Selecione o responsável");
      return false;
    }
    return true;
  };

  const validateThawingForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return false;
    }
    if (thawingQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return false;
    }
    if (!thawingStartDate || !thawingStartTime) {
      toast.error("Preencha a data e hora de início");
      return false;
    }
    if (!thawingValidityDate || !thawingValidityTime) {
      toast.error("Preencha a data e hora do fim");
      return false;
    }
    if (!thawingResponsible.trim()) {
      toast.error("Selecione o responsável");
      return false;
    }
    return true;
  };

  const validateManipulatedForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return false;
    }
    if (!manipulatedPreparationName.trim()) {
      toast.error("Preencha a preparação");
      return false;
    }
    if (manipulatedQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return false;
    }
    if (!manipulatedAtDate || !manipulatedAtTime) {
      toast.error("Preencha a data e hora de manipulação");
      return false;
    }
    if (!manipulatedValidityDate || !manipulatedValidityTime) {
      toast.error("Preencha a data e hora da validade");
      return false;
    }
    if (!manipulatedResponsible.trim()) {
      toast.error("Selecione o responsável");
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    switch (activeTab) {
      case "sample":
        return Boolean(
          selectedProductId &&
            sampleName.trim() &&
            sampleQuantity > 0 &&
            sampleCollectionDate &&
            sampleCollectionTime &&
            sampleDiscardDate &&
            sampleDiscardTime &&
            sampleResponsible.trim(),
        );
      case "opened_product":
        return Boolean(
          selectedProductId &&
            openedQuantity > 0 &&
            openedAtDate &&
            openedAtTime &&
            openedOriginalValidityDate &&
            openedValidityDate &&
            openedValidityTime &&
            openedResponsible.trim(),
        );
      case "thawing":
        return Boolean(
          selectedProductId &&
            thawingQuantity > 0 &&
            thawingStartDate &&
            thawingStartTime &&
            thawingValidityDate &&
            thawingValidityTime &&
            thawingResponsible.trim(),
        );
      case "manipulated":
        return Boolean(
          selectedProductId &&
            manipulatedPreparationName.trim() &&
            manipulatedQuantity > 0 &&
            manipulatedAtDate &&
            manipulatedAtTime &&
            manipulatedValidityDate &&
            manipulatedValidityTime &&
            manipulatedResponsible.trim(),
        );
    }
  };

  const renderResponsibleSelect = (
    value: string,
    onChange: (nextValue: string) => void,
  ) => (
    <div className="space-y-2">
      <Label>
        Responsável <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={!isGestor}>
        <SelectTrigger className="w-full h-12">
          <SelectValue placeholder="Selecione o responsável" />
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => {
            const name = getMemberDisplayName(member);
            return (
              <SelectItem key={member.id} value={name}>
                {name !== member.id ? name : "Usuário"}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  const renderProductSummary = () =>
    selectedProductId ? (
      <p className="text-xs text-slate-400 mt-1">Produto: {selectedProductName}</p>
    ) : null;

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-white sticky top-0 z-20 rounded-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-slate-800">Imprimir Etiqueta</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 flex-1 overflow-y-auto pb-28">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as LabelTab)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto bg-slate-100 p-1 rounded-xl sticky top-0 z-10 gap-1">
            <TabsTrigger
              value="opened_product"
              className="min-h-11 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <ShoppingBasket className="h-4 w-4" />
              Produto Aberto
            </TabsTrigger>
            <TabsTrigger
              value="sample"
              className="min-h-11 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <FlaskConical className="h-4 w-4" />
              Amostra
            </TabsTrigger>
            <TabsTrigger
              value="thawing"
              className="min-h-11 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Snowflake className="h-4 w-4" />
              Descongelo
            </TabsTrigger>
            <TabsTrigger
              value="manipulated"
              className="min-h-11 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Thermometer className="h-4 w-4" />
              Manipulado
            </TabsTrigger>
          </TabsList>

          {/* ═══════ OPENED PRODUCT TAB ═══════ */}
          <TabsContent value="opened_product" className="mt-4 space-y-4">
            {/* 1 – Product picker */}
            <ProductPickerSection
              groups={groups}
              products={products}
              loading={loading}
              selectedGroupId={selectedGroupId}
              selectedProductId={selectedProductId}
              groupFilter={groupFilter}
              productFilter={productFilter}
              onGroupSelect={handleGroupSelect}
              onProductSelect={handleProductSelect}
              onGroupFilterChange={setGroupFilter}
              onProductFilterChange={setProductFilter}
              onCreateProduct={handleCreateProduct}
              filterByGroup={filterByGroup}
              onFilterByGroupChange={(v) => {
                setFilterByGroup(v);
                if (!v) setSelectedGroupId("");
              }}
            />

            {/* 2 – Form fields (always visible) */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <ShoppingBasket className="h-4 w-4 text-sky-600" />
                  Dados do Produto Aberto
                </CardTitle>
                {renderProductSummary()}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <UnitOfMeasureField
                  stockUnit={effectiveUnit}
                  value={openedCustomUnit}
                  onChange={setOpenedCustomUnit}
                  quantity={openedQuantity}
                  onQuantityChange={setOpenedQuantity}
                />

                <LabelCopiesField
                  id="opened-product-label-copies"
                  value={openedLabelCopies}
                  onChange={setOpenedLabelCopies}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="opened-at-date">
                      Aberto em <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="opened-at-date"
                      type="date"
                      className="h-12"
                      value={openedAtDate}
                      onChange={(e) => setOpenedAtDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opened-at-time">
                      Hora da abertura <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="opened-at-time"
                      type="time"
                      className="h-12"
                      value={openedAtTime}
                      onChange={(e) => setOpenedAtTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="opened-original-validity-date">
                      Validade original <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="opened-original-validity-date"
                      type="date"
                      className="h-12"
                      value={openedOriginalValidityDate}
                      onChange={(e) =>
                        setOpenedOriginalValidityDate(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="opened-validity-date">
                      Validade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="opened-validity-date"
                      type="date"
                      className="h-12"
                      value={openedValidityDate}
                      onChange={(e) => setOpenedValidityDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opened-validity-time">
                      Hora da validade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="opened-validity-time"
                      type="time"
                      className="h-12"
                      value={openedValidityTime}
                      onChange={(e) => setOpenedValidityTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Conservação <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <ConservationOption
                      mode="REFRIGERADO"
                      label="Refrigerado"
                      icon={<Thermometer className="h-5 w-5" />}
                      isSelected={openedConservationMode === "REFRIGERADO"}
                      onSelect={setOpenedConservationMode}
                    />
                    <ConservationOption
                      mode="CONGELADO"
                      label="Congelado"
                      icon={<Snowflake className="h-5 w-5" />}
                      isSelected={openedConservationMode === "CONGELADO"}
                      onSelect={setOpenedConservationMode}
                    />
                    <ConservationOption
                      mode="AMBIENTE"
                      label="T° AMBIENTE"
                      icon={<Sun className="h-5 w-5" />}
                      isSelected={openedConservationMode === "AMBIENTE"}
                      onSelect={setOpenedConservationMode}
                    />
                  </div>
                </div>

                {renderResponsibleSelect(
                  openedResponsible,
                  setOpenedResponsible,
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════ SAMPLE TAB ═══════ */}
          <TabsContent value="sample" className="mt-4 space-y-4">
            <ProductPickerSection
              groups={groups}
              products={products}
              loading={loading}
              selectedGroupId={selectedGroupId}
              selectedProductId={selectedProductId}
              groupFilter={groupFilter}
              productFilter={productFilter}
              onGroupSelect={handleGroupSelect}
              onProductSelect={handleProductSelect}
              onGroupFilterChange={setGroupFilter}
              onProductFilterChange={setProductFilter}
              onCreateProduct={handleCreateProduct}
              filterByGroup={filterByGroup}
              onFilterByGroupChange={(value) => {
                setFilterByGroup(value);
                if (!value) setSelectedGroupId("");
              }}
            />

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-purple-600" />
                  Dados da Amostra
                </CardTitle>
                {renderProductSummary()}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sample-name">
                    Preparação / Amostra{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sample-name"
                    placeholder="Ex: Feijoada, Salpicão"
                    className="h-12"
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                  />
                </div>

                <UnitOfMeasureField
                  stockUnit={null}
                  value={sampleCustomUnit}
                  onChange={setSampleCustomUnit}
                  quantity={sampleQuantity}
                  onQuantityChange={setSampleQuantity}
                />

                <LabelCopiesField
                  id="sample-label-copies"
                  value={sampleLabelCopies}
                  onChange={setSampleLabelCopies}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sample-collection-date">
                      Data da coleta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-collection-date"
                      type="date"
                      className="h-12"
                      value={sampleCollectionDate}
                      onChange={(e) => setSampleCollectionDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sample-collection-time">
                      Hora da coleta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-collection-time"
                      type="time"
                      className="h-12"
                      value={sampleCollectionTime}
                      onChange={(e) => setSampleCollectionTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sample-discard-date">
                      Data do descarte <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-discard-date"
                      type="date"
                      className="h-12 bg-slate-50"
                      value={sampleDiscardDate}
                      onChange={(e) => setSampleDiscardDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sample-discard-time">
                      Hora do descarte <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-discard-time"
                      type="time"
                      className="h-12 bg-slate-50"
                      value={sampleDiscardTime}
                      onChange={(e) => setSampleDiscardTime(e.target.value)}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Descarte sugerido automaticamente para 72h após a coleta.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="sample-shift">Turno</Label>
                  <Input
                    id="sample-shift"
                    placeholder="Ex: Almoco"
                    className="h-12"
                    value={sampleShift}
                    onChange={(e) => setSampleShift(e.target.value)}
                  />
                </div>

                {renderResponsibleSelect(
                  sampleResponsible,
                  setSampleResponsible,
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════ THAWING TAB ═══════ */}
          <TabsContent value="thawing" className="mt-4 space-y-4">
            <ProductPickerSection
              groups={groups}
              products={products}
              loading={loading}
              selectedGroupId={selectedGroupId}
              selectedProductId={selectedProductId}
              groupFilter={groupFilter}
              productFilter={productFilter}
              onGroupSelect={handleGroupSelect}
              onProductSelect={handleProductSelect}
              onGroupFilterChange={setGroupFilter}
              onProductFilterChange={setProductFilter}
              onCreateProduct={handleCreateProduct}
              filterByGroup={filterByGroup}
              onFilterByGroupChange={(value) => {
                setFilterByGroup(value);
                if (!value) setSelectedGroupId("");
              }}
            />

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-cyan-600" />
                  Dados do Descongelo
                </CardTitle>
                {renderProductSummary()}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <UnitOfMeasureField
                  stockUnit={effectiveUnit}
                  value={thawingCustomUnit}
                  onChange={setThawingCustomUnit}
                  quantity={thawingQuantity}
                  onQuantityChange={setThawingQuantity}
                />

                <LabelCopiesField
                  id="thawing-label-copies"
                  value={thawingLabelCopies}
                  onChange={setThawingLabelCopies}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="thawing-start-date">
                      Início do descongelo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="thawing-start-date"
                      type="date"
                      className="h-12"
                      value={thawingStartDate}
                      onChange={(e) => setThawingStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thawing-start-time">
                      Hora do início <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="thawing-start-time"
                      type="time"
                      className="h-12"
                      value={thawingStartTime}
                      onChange={(e) => setThawingStartTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="thawing-validity-date">
                      Fim <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="thawing-validity-date"
                      type="date"
                      className="h-12"
                      value={thawingValidityDate}
                      onChange={(e) => setThawingValidityDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thawing-validity-time">
                      Hora do fim <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="thawing-validity-time"
                      type="time"
                      className="h-12"
                      value={thawingValidityTime}
                      onChange={(e) => setThawingValidityTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thawing-lot">Lote</Label>
                  <Input
                    id="thawing-lot"
                    placeholder="Ex: LT-001"
                    className="h-12"
                    value={thawingLot}
                    onChange={(e) => setThawingLot(e.target.value)}
                  />
                </div>

                {renderResponsibleSelect(
                  thawingResponsible,
                  setThawingResponsible,
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════ MANIPULATED TAB ═══════ */}
          <TabsContent value="manipulated" className="mt-4 space-y-4">
            <ProductPickerSection
              groups={groups}
              products={products}
              loading={loading}
              selectedGroupId={selectedGroupId}
              selectedProductId={selectedProductId}
              groupFilter={groupFilter}
              productFilter={productFilter}
              onGroupSelect={handleGroupSelect}
              onProductSelect={handleProductSelect}
              onGroupFilterChange={setGroupFilter}
              onProductFilterChange={setProductFilter}
              onCreateProduct={handleCreateProduct}
              filterByGroup={filterByGroup}
              onFilterByGroupChange={(value) => {
                setFilterByGroup(value);
                if (!value) setSelectedGroupId("");
              }}
            />

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-emerald-600" />
                  Dados do Manipulado
                </CardTitle>
                {renderProductSummary()}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manipulated-preparation-name">
                    Preparação <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="manipulated-preparation-name"
                    placeholder="Ex: Feijoada, Salpicão"
                    className="h-12"
                    value={manipulatedPreparationName}
                    onChange={(e) =>
                      setManipulatedPreparationName(e.target.value)
                    }
                  />
                </div>

                <UnitOfMeasureField
                  stockUnit={effectiveUnit}
                  value={manipulatedCustomUnit}
                  onChange={setManipulatedCustomUnit}
                  quantity={manipulatedQuantity}
                  onQuantityChange={setManipulatedQuantity}
                />

                <LabelCopiesField
                  id="manipulated-label-copies"
                  value={manipulatedLabelCopies}
                  onChange={setManipulatedLabelCopies}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="manipulated-at-date">
                      Fabricação <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="manipulated-at-date"
                      type="date"
                      className="h-12"
                      value={manipulatedAtDate}
                      onChange={(e) => setManipulatedAtDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manipulated-at-time">
                      Hora da fabricação <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="manipulated-at-time"
                      type="time"
                      className="h-12"
                      value={manipulatedAtTime}
                      onChange={(e) => setManipulatedAtTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="manipulated-validity-date">
                      Validade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="manipulated-validity-date"
                      type="date"
                      className="h-12"
                      value={manipulatedValidityDate}
                      onChange={(e) =>
                        setManipulatedValidityDate(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manipulated-validity-time">
                      Hora da validade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="manipulated-validity-time"
                      type="time"
                      className="h-12"
                      value={manipulatedValidityTime}
                      onChange={(e) =>
                        setManipulatedValidityTime(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Conservação <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <ConservationOption
                      mode="REFRIGERADO"
                      label="Refrigerado"
                      icon={<Thermometer className="h-5 w-5" />}
                      isSelected={manipulatedConservationMode === "REFRIGERADO"}
                      onSelect={setManipulatedConservationMode}
                    />
                    <ConservationOption
                      mode="CONGELADO"
                      label="Congelado"
                      icon={<Snowflake className="h-5 w-5" />}
                      isSelected={manipulatedConservationMode === "CONGELADO"}
                      onSelect={setManipulatedConservationMode}
                    />
                    <ConservationOption
                      mode="AMBIENTE"
                      label="T° AMBIENTE"
                      icon={<Sun className="h-5 w-5" />}
                      isSelected={manipulatedConservationMode === "AMBIENTE"}
                      onSelect={setManipulatedConservationMode}
                    />
                  </div>
                </div>

                {renderResponsibleSelect(
                  manipulatedResponsible,
                  setManipulatedResponsible,
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex flex-col md:flex-row gap-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:bg-transparent md:border-none md:shadow-none md:p-4">
        <div className="flex-1 w-full md:max-w-[200px]">
          <Select
            value={selectedPrinter}
            onValueChange={setSelectedPrinter}
            disabled={loadingPrinters || printers.length === 0}
          >
            <SelectTrigger className="h-12 w-full text-xs font-medium bg-slate-50 border-slate-200">
              <Printer className="mr-2 h-4 w-4 text-slate-500" />
              <SelectValue
                placeholder={
                  printers.length === 0
                    ? "Impressora Offline"
                    : "Escolher Impressão"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {printers.map((p) => (
                <SelectItem key={p.printerName} value={p.printerName}>
                  {p.printerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 gap-2"
            onClick={() => handleSave(false)}
            disabled={saving || !isFormValid()}
          >
            <Save className="h-5 w-5" /> Salvar
          </Button>
          <Button
            className="flex-1 h-12 gap-2 bg-primary"
            onClick={() => handleSave(true)}
            disabled={saving || !isFormValid() || printers.length === 0}
          >
            <Printer className="h-5 w-5" /> Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
}
