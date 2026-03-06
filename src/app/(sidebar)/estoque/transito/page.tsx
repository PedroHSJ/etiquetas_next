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
import { DevicesService, PrinterInfo } from "@/lib/services/client/devices-service";
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

function getCurrentClientTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
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
  const { activeOrganizationDetails, refreshActiveOrganization } = useOrganization();
  const { user } = useAuth();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || "";
  const organizationName =
    activeOrganizationDetails?.name ||
    activeProfile?.userOrganization?.organization?.name || "";
  const organizationCnpj =
    activeOrganizationDetails?.cnpj ||
    activeProfile?.userOrganization?.organization?.cnpj || "";
  const organizationZipCode =
    activeOrganizationDetails?.zipCode ||
    activeProfile?.userOrganization?.organization?.zipCode || "";
  const organizationAddress =
    activeOrganizationDetails?.address ||
    activeProfile?.userOrganization?.organization?.address || "";
  const organizationNumber =
    activeOrganizationDetails?.number ||
    activeProfile?.userOrganization?.organization?.number || "";
  const organizationAddressComplement =
    activeOrganizationDetails?.addressComplement ||
    activeProfile?.userOrganization?.organization?.addressComplement || "";
  const organizationCity =
    activeOrganizationDetails?.city?.name || "";
  const organizationState =
    activeOrganizationDetails?.state?.code || "";
  const isGestor =
    activeProfile?.profile?.name?.toLowerCase().includes("gestor") || false;

  // Tab
  const [activeTab, setActiveTab] = useState<"amostras" | "produtos">(
    "amostras",
  );

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

  // Custom unit (only used when stockInfo.quantity === 0)
  const [customUnit, setCustomUnit] = useState("un");

  // The effective unit
  const effectiveUnit =
    stockInfo && stockInfo.quantity > 0 ? stockInfo.unit : null;

  // ====== SAMPLES state ======
  const [sampleName, setSampleName] = useState("");
  const [sampleTime, setSampleTime] = useState("");
  const [sampleCollectionDate, setSampleCollectionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sampleDiscardDate, setSampleDiscardDate] = useState("");
  const [sampleResponsible, setSampleResponsible] = useState("");
  const [sampleQuantity, setSampleQuantity] = useState<number>(1);
  const [sampleLabelCopies, setSampleLabelCopies] = useState<number>(1);

  // ====== PRODUCTS state ======
  const [productManufacturingDate, setProductManufacturingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [productExpiryDate, setProductExpiryDate] = useState("");
  const [productOpeningDate, setProductOpeningDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [productExpiryAfterOpeningDate, setProductExpiryAfterOpeningDate] =
    useState("");
  const [productConservationMode, setProductConservationMode] =
    useState<ConservationMode>("REFRIGERADO");
  const [productResponsible, setProductResponsible] = useState("");
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [productLabelCopies, setProductLabelCopies] = useState<number>(1);
  const [filterByGroup, setFilterByGroup] = useState(false);

  // ────── Queries ──────
  const { data: members = [] } = useQuery<Member[], Error>({
    queryKey: ["members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return MemberService.listByOrganization(
        organizationId,
      ) as unknown as Member[];
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
    if (sampleCollectionDate) {
      const d = new Date(sampleCollectionDate);
      d.setDate(d.getDate() + 3);
      setSampleDiscardDate(d.toISOString().split("T")[0]);
    }
  }, [sampleCollectionDate]);

  useEffect(() => {
    setSampleTime((current) => current || getCurrentClientTime());
  }, []);

  useEffect(() => {
    if (organizationId) loadGroups();
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      refreshActiveOrganization();
    }
  }, [organizationId, refreshActiveOrganization]);

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
      if (!productResponsible || !isGestor) {
        setProductResponsible(user.name);
      }
    }
  }, [user?.name, isGestor, sampleResponsible, productResponsible]);

  // Reset selections when switching tabs
  useEffect(() => {
    setSelectedGroupId("");
    setSelectedProductId("");
    setGroupFilter("");
    setProductFilter("");
    setStockInfo(null);
    setCustomUnit("un");
  }, [activeTab]);

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
    if (!sampleTime) {
      toast.error("Preencha o horário");
      return false;
    }
    if (!sampleCollectionDate) {
      toast.error("Preencha a data da coleta");
      return false;
    }
    if (!sampleResponsible.trim()) {
      toast.error("Selecione o responsável");
      return false;
    }
    return true;
  };

  const validateProductForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return false;
    }
    if (productQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return false;
    }
    if (!productManufacturingDate) {
      toast.error("Preencha a data de fabricação");
      return false;
    }
    if (!productExpiryDate) {
      toast.error("Preencha a data de validade");
      return false;
    }
    if (!productResponsible.trim()) {
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
  const resolveUnit = () =>
    stockInfo && stockInfo.quantity > 0 ? stockInfo.unit : customUnit;

  const handleSaveSample = async (print: boolean = false) => {
    if (!validateSampleForm()) return;
    try {
      setSaving(true);

      if (print) {
        if (!validateLabelCopies(sampleLabelCopies)) return;

        const finalPrinter = selectedPrinter || defaultPrinterName || "LABEL PRINTER";
        const printed = await LabelPrinterService.printSampleLabel(
          {
            sampleName,
            collectionTime: sampleTime,
            collectionDate: sampleCollectionDate,
            discardDate: sampleDiscardDate,
            responsibleName: sampleResponsible,
          },
          finalPrinter,
          organizationId,
          sampleLabelCopies,
        );

        if (!printed) {
          toast.error("Falha ao imprimir. O registro nao foi salvo no estoque em transito.");
          return;
        }

        toast.success(formatPrintSuccessMessage(sampleLabelCopies, finalPrinter));
      }

      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: sampleQuantity,
        unitOfMeasureCode: resolveUnit(),
        manufacturingDate: sampleCollectionDate,
        expiryDate: sampleDiscardDate,
        observations: `AMOSTRA - ${sampleName} (${sampleTime})`,
        organizationId,
      });
      toast.success("Amostra registrada no estoque em transito!");

      router.push("/estoque");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProduct = async (print: boolean = false) => {
    if (!validateProductForm()) return;
    try {
      setSaving(true);
      const product = products.find(
        (p) => p.id.toString() === selectedProductId,
      );

      if (print) {
        if (!validateLabelCopies(productLabelCopies)) return;

        let orgDetails = activeOrganizationDetails;
        if (organizationId && (!orgDetails?.city || !orgDetails?.state)) {
          try {
            orgDetails = await OrganizationService.getOrganizationByIdExpanded(organizationId);
          } catch (error) {
            console.warn("Falha ao recarregar detalhes da organizacao para etiqueta", error);
          }
        }

        const resolvedOrganizationName = orgDetails?.name || organizationName;
        const resolvedOrganizationCnpj = orgDetails?.cnpj || organizationCnpj;
        const resolvedOrganizationZipCode = orgDetails?.zipCode || organizationZipCode;
        const resolvedOrganizationAddress = orgDetails?.address || organizationAddress;
        const resolvedOrganizationNumber = orgDetails?.number || organizationNumber;
        const resolvedOrganizationAddressComplement =
          orgDetails?.addressComplement || organizationAddressComplement;
        const resolvedOrganizationCity = orgDetails?.city?.name || organizationCity;
        const resolvedOrganizationState = orgDetails?.state?.code || organizationState;

        const finalPrinter = selectedPrinter || defaultPrinterName || "LABEL PRINTER";
        const printed = await LabelPrinterService.printProductLabel(
          {
            productName: product?.name || "Produto",
            manufacturingDate: productManufacturingDate,
            validityDate: productExpiryDate,
            openingDate: productOpeningDate,
            validityAfterOpening: productExpiryAfterOpeningDate,
            conservationMode: productConservationMode,
            responsibleName: productResponsible,
            organizationName: resolvedOrganizationName,
            organizationCnpj: resolvedOrganizationCnpj,
            organizationZipCode: resolvedOrganizationZipCode,
            organizationAddress: resolvedOrganizationAddress,
            organizationNumber: resolvedOrganizationNumber,
            organizationAddressComplement: resolvedOrganizationAddressComplement,
            organizationCity: resolvedOrganizationCity,
            organizationState: resolvedOrganizationState,
            quantity: productQuantity,
            unit: resolveUnit(),
          },
          finalPrinter,
          organizationId,
          productLabelCopies,
        );

        if (!printed) {
          toast.error("Falha ao imprimir. O registro nao foi salvo no estoque em transito.");
          return;
        }

        toast.success(formatPrintSuccessMessage(productLabelCopies, finalPrinter));
      }

      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: productQuantity,
        unitOfMeasureCode: resolveUnit(),
        manufacturingDate: productManufacturingDate,
        expiryDate: productExpiryDate,
        observations: `Conservacao: ${productConservationMode}`,
        organizationId,
      });
      toast.success("Salvo no estoque em transito!");

      router.push("/estoque");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (print: boolean) => {
    if (activeTab === "amostras") handleSaveSample(print);
    else handleSaveProduct(print);
  };

  const isFormValid = () => {
    if (activeTab === "amostras") {
      return (
        selectedProductId &&
        sampleName.trim() &&
        sampleQuantity > 0 &&
        sampleTime &&
        sampleCollectionDate &&
        sampleResponsible.trim()
      );
    }
    return (
      selectedProductId &&
      productQuantity > 0 &&
      productManufacturingDate &&
      productExpiryDate &&
      productResponsible.trim()
    );
  };

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
          onValueChange={(v) => setActiveTab(v as "amostras" | "produtos")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 h-12 bg-slate-100 p-1 rounded-xl sticky top-0 z-10">
            <TabsTrigger
              value="amostras"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <FlaskConical className="h-4 w-4" />
              Amostras
            </TabsTrigger>
            <TabsTrigger
              value="produtos"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <ShoppingBasket className="h-4 w-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          {/* ═══════ SAMPLES TAB ═══════ */}
          <TabsContent value="amostras" className="mt-4 space-y-4">
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
                  <FlaskConical className="h-4 w-4 text-purple-600" />
                  Dados da Amostra
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sample-name">
                    Nome da Amostra <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sample-name"
                    placeholder="Ex: Salada de Frutas"
                    className="h-12"
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                  />
                </div>

                <UnitOfMeasureField
                  stockUnit={effectiveUnit}
                  value={customUnit}
                  onChange={setCustomUnit}
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
                    <Label htmlFor="sample-time">
                      Horário <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-time"
                      type="time"
                      className="h-12"
                      value={sampleTime}
                      onChange={(e) => setSampleTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sample-collection">
                      Data Coleta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-collection"
                      type="date"
                      className="h-12"
                      value={sampleCollectionDate}
                      onChange={(e) => setSampleCollectionDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample-discard">Data do Descarte</Label>
                  <Input
                    id="sample-discard"
                    type="date"
                    className="h-12 bg-slate-50"
                    value={sampleDiscardDate}
                    onChange={(e) => setSampleDiscardDate(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Calculado automaticamente (72h após coleta)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Responsável <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={sampleResponsible}
                    onValueChange={setSampleResponsible}
                    disabled={!isGestor}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {(members as any[]).map((member) => {
                        const name =
                          member.users?.name || member.user?.name || member.id;
                        return (
                          <SelectItem key={member.id} value={name}>
                            {name !== member.id ? name : "Usuário"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════ PRODUCTS TAB ═══════ */}
          <TabsContent value="produtos" className="mt-4 space-y-4">
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
                  📋 Informações da Etiqueta
                </CardTitle>
                {selectedProductId && (
                  <p className="text-xs text-slate-400 mt-1">
                    Produto:{" "}
                    {
                      products.find(
                        (p) => p.id.toString() === selectedProductId,
                      )?.name
                    }
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <UnitOfMeasureField
                  stockUnit={effectiveUnit}
                  value={customUnit}
                  onChange={setCustomUnit}
                  quantity={productQuantity}
                  onQuantityChange={setProductQuantity}
                />

                <LabelCopiesField
                  id="product-label-copies"
                  value={productLabelCopies}
                  onChange={setProductLabelCopies}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-manufacturing">
                      Fabricação <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-manufacturing"
                      type="date"
                      className="h-12"
                      value={productManufacturingDate}
                      onChange={(e) =>
                        setProductManufacturingDate(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-expiry">
                      Validade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-expiry"
                      type="date"
                      className="h-12"
                      value={productExpiryDate}
                      onChange={(e) => setProductExpiryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-opening">Abertura</Label>
                    <Input
                      id="product-opening"
                      type="date"
                      className="h-12"
                      value={productOpeningDate}
                      onChange={(e) => setProductOpeningDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-expiry-after-opening">
                      Val. após abertura
                    </Label>
                    <Input
                      id="product-expiry-after-opening"
                      type="date"
                      className="h-12"
                      value={productExpiryAfterOpeningDate}
                      onChange={(e) =>
                        setProductExpiryAfterOpeningDate(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Conservation Mode */}
                <div className="space-y-2">
                  <Label>
                    Conservação <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <ConservationOption
                      mode="REFRIGERADO"
                      label="Refrigerado"
                      icon={<Thermometer className="h-5 w-5" />}
                      isSelected={productConservationMode === "REFRIGERADO"}
                      onSelect={setProductConservationMode}
                    />
                    <ConservationOption
                      mode="CONGELADO"
                      label="Congelado"
                      icon={<Snowflake className="h-5 w-5" />}
                      isSelected={productConservationMode === "CONGELADO"}
                      onSelect={setProductConservationMode}
                    />
                    <ConservationOption
                      mode="AMBIENTE"
                      label="T° Ambiente"
                      icon={<Sun className="h-5 w-5" />}
                      isSelected={productConservationMode === "AMBIENTE"}
                      onSelect={setProductConservationMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Responsável <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={productResponsible}
                    onValueChange={setProductResponsible}
                    disabled={!isGestor}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {(members as any[]).map((member) => {
                        const name =
                          member.users?.name || member.user?.name || member.id;
                        return (
                          <SelectItem key={member.id} value={name}>
                            {name !== member.id ? name : "Usuário"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex flex-col md:flex-row gap-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:bg-transparent md:border-none md:shadow-none md:p-4">
        <div className="flex-1 max-w-xs md:max-w-[200px]">
          <Select value={selectedPrinter} onValueChange={setSelectedPrinter} disabled={loadingPrinters || printers.length === 0}>
            <SelectTrigger className="h-12 w-full text-xs font-medium bg-slate-50 border-slate-200">
               <Printer className="mr-2 h-4 w-4 text-slate-500" />
               <SelectValue placeholder={printers.length === 0 ? "Impressora Offline" : "Escolher Impressão"} />
            </SelectTrigger>
            <SelectContent>
                {printers.map((p) => (
                    <SelectItem key={p.printerName} value={p.printerName}>{p.printerName}</SelectItem>
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
