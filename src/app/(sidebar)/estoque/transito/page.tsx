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
  Package,
  Printer,
  Save,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  ShoppingBasket,
  Snowflake,
  Thermometer,
  Sun,
  Check,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { ProductService } from "@/lib/services/client/product-service";
import { StockInTransitService } from "@/lib/services/client/stock-in-transit-service";
import { LabelPrinterService } from "@/lib/services/client/label-printer-service";
import { StockService } from "@/lib/services/client/stock-service";
import { Product, ProductGroup } from "@/types/models/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Member } from "@/types/models/member";
import { MemberService } from "@/lib/services/client/member-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConservationMode = "REFRIGERADO" | "CONGELADO" | "AMBIENTE";

interface SelectableCardProps {
  id: string;
  name: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

function SelectableCard({
  id,
  name,
  isSelected,
  onSelect,
  disabled,
  badge,
  badgeVariant = "secondary",
}: SelectableCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(id)}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "font-medium text-sm",
            isSelected ? "text-primary" : "text-slate-700",
          )}
        >
          {name}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

interface ConservationOptionProps {
  mode: ConservationMode;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (mode: ConservationMode) => void;
}

function ConservationOption({
  mode,
  label,
  icon,
  isSelected,
  onSelect,
}: ConservationOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600",
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-xs font-medium text-center",
          isSelected ? "text-primary" : "text-slate-600",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export default function EstoqueTransitoPage() {
  const router = useRouter();
  const { activeProfile } = useProfile();
  const organizationId = activeProfile?.userOrganization?.organizationId || "";

  // Tab state
  const [activeTab, setActiveTab] = useState<"amostras" | "produtos">(
    "amostras",
  );

  // Data state
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selection state
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [stockInfo, setStockInfo] = useState<{
    quantity: number;
    unit: string;
  } | null>(null);

  // Filter state
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("");

  // Filtered data
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(groupFilter.toLowerCase()),
  );
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productFilter.toLowerCase()),
  );

  // ====== SAMPLES - Form State ======
  const [sampleName, setSampleName] = useState<string>("");
  const [sampleTime, setSampleTime] = useState<string>("");
  const [sampleCollectionDate, setSampleCollectionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [sampleDiscardDate, setSampleDiscardDate] = useState<string>("");
  const [sampleResponsible, setSampleResponsible] = useState<string>("");

  // ====== PRODUCTS - Form State ======
  const [productManufacturingDate, setProductManufacturingDate] =
    useState<string>(new Date().toISOString().split("T")[0]);
  const [productExpiryDate, setProductExpiryDate] = useState<string>("");
  const [productOpeningDate, setProductOpeningDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [productExpiryAfterOpeningDate, setProductExpiryAfterOpeningDate] =
    useState<string>("");
  const [productConservationMode, setProductConservationMode] =
    useState<ConservationMode>("REFRIGERADO");
  const [productResponsible, setProductResponsible] = useState<string>("");

  const { data: members = [], isLoading } = useQuery<Member[], Error>({
    queryKey: ["members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return MemberService.listByOrganization(organizationId);
    },
    enabled: !!organizationId,
  });

  useEffect(() => {
    // Calculate discard date (72 hours = 3 days after collection)
    if (sampleCollectionDate) {
      const collection = new Date(sampleCollectionDate);
      collection.setDate(collection.getDate() + 3);
      setSampleDiscardDate(collection.toISOString().split("T")[0]);
    }
  }, [sampleCollectionDate]);

  useEffect(() => {
    if (organizationId && activeTab === "produtos") {
      loadGroups();
    }
  }, [organizationId, activeTab]);

  useEffect(() => {
    if (selectedGroupId && organizationId) {
      loadProducts(selectedGroupId);
    } else {
      setProducts([]);
      setSelectedProductId("");
    }
  }, [selectedGroupId, organizationId]);

  useEffect(() => {
    if (selectedProductId && organizationId) {
      checkStock(selectedProductId);
    } else {
      setStockInfo(null);
    }
  }, [selectedProductId, organizationId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getGroups(organizationId);
      setGroups(data);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("Erro ao carregar grupos de alimentos");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (groupId: string) => {
    try {
      setLoading(true);
      const allProducts = await ProductService.getProducts(organizationId);
      // console.table(allProducts);
      const filtered = allProducts.filter(
        (p) => p.groupId === parseInt(groupId),
      );
      setProducts(filtered);
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
    } catch (error) {
      console.error("Error checking stock:", error);
      setStockInfo(null);
    }
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id === selectedGroupId ? "" : id);
    setSelectedProductId("");
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id === selectedProductId ? "" : id);
  };

  const validateSampleForm = (): boolean => {
    if (!sampleName.trim()) {
      toast.error("Preencha o nome da amostra");
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
      toast.error("Preencha o responsável");
      return false;
    }
    return true;
  };

  const validateProductForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
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
      toast.error("Preencha o responsável");
      return false;
    }
    return true;
  };

  const handleSaveSample = async (print: boolean = false) => {
    if (!validateSampleForm()) return;

    try {
      setSaving(true);

      // TODO: Save to database if needed

      if (print) {
        // const printerStatus = await LabelPrinterService.checkStatus();
        const printerStatus = true;
        if (!printerStatus) {
          toast.warning(
            "Agente de impressão não detectado (localhost:5000). A etiqueta não foi impressa.",
          );
        } else {
          const printed = await LabelPrinterService.printSampleLabel({
            sampleName: sampleName,
            collectionTime: sampleTime,
            collectionDate: sampleCollectionDate,
            discardDate: sampleDiscardDate,
            responsibleName: sampleResponsible,
          });

          if (printed) {
            toast.success("Etiqueta de amostra enviada para impressão!");
          } else {
            toast.error("Falha ao imprimir etiqueta.");
          }
        }
      } else {
        toast.success("Dados salvos com sucesso!");
      }

      router.push("/estoque");
    } catch (error) {
      console.error("Error saving:", error);
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

      // Save to stock in transit
      await StockInTransitService.create({
        productId: parseInt(selectedProductId),
        quantity: 1,
        unitOfMeasureCode: stockInfo?.unit || "un",
        expiryDate: productExpiryDate,
        observations: `Conservação: ${productConservationMode}`,
        organizationId: organizationId,
      });

      toast.success("Salvo no estoque em trânsito!");

      if (print) {
        // const printerStatus = await LabelPrinterService.checkStatus();
        const printerStatus = true;
        if (!printerStatus) {
          toast.warning(
            "Agente de impressão não detectado (localhost:5000). A etiqueta não foi impressa.",
          );
        } else {
          const printed = await LabelPrinterService.printProductLabel({
            productName: product?.name || "Produto",
            manufacturingDate: productManufacturingDate,
            validityDate: productExpiryDate,
            openingDate: productOpeningDate,
            validityAfterOpening: productExpiryAfterOpeningDate,
            conservationMode: productConservationMode,
            responsibleName: productResponsible,
          });

          if (printed) {
            toast.success("Etiqueta de produto enviada para impressão!");
          } else {
            toast.error("Falha ao imprimir etiqueta.");
          }
        }
      }

      router.push("/estoque");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Erro ao salvar no estoque em trânsito");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (print: boolean = false) => {
    if (activeTab === "amostras") {
      handleSaveSample(print);
    } else {
      handleSaveProduct(print);
    }
  };

  const isFormValid = () => {
    if (activeTab === "amostras") {
      return (
        sampleName.trim() &&
        sampleTime &&
        sampleCollectionDate &&
        sampleResponsible.trim()
      );
    } else {
      return (
        selectedProductId &&
        productManufacturingDate &&
        productExpiryDate &&
        productResponsible.trim()
      );
    }
  };

  if (loading && groups.length === 0 && activeTab === "produtos") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center p-4 border-b">
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
      <div className="px-4 pt-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "amostras" | "produtos")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 h-12 bg-slate-100 p-1 rounded-xl">
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

          <div className="pb-28">
            {/* SAMPLES TAB */}
            <TabsContent value="amostras" className="mt-4 space-y-4">
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
                      Nome da Amostra{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sample-name"
                      placeholder="Ex: Salada de Frutas"
                      className="h-12"
                      value={sampleName}
                      onChange={(e) => setSampleName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
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
                        Data da Coleta{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="sample-collection"
                        type="date"
                        className="h-12"
                        value={sampleCollectionDate}
                        onChange={(e) =>
                          setSampleCollectionDate(e.target.value)
                        }
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
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Obs: Descarte após 72 horas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sample-responsible">
                      Responsável <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={sampleResponsible}
                      onValueChange={setSampleResponsible}
                    >
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.user.name}>
                            {member.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PRODUCTS TAB */}
            <TabsContent value="produtos" className="space-y-4">
              {/* Group Selection - Show only when no group is selected */}
              {!selectedGroupId && (
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      1. Selecione o Grupo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      placeholder="Buscar grupo..."
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                      className="h-10"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
                      {filteredGroups.map((group) => (
                        <SelectableCard
                          key={group.id}
                          id={group.id.toString()}
                          name={group.name}
                          isSelected={selectedGroupId === group.id.toString()}
                          onSelect={handleSelectGroup}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Selection - Show only when a group is selected AND no product selected */}
              {selectedGroupId && !selectedProductId && (
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGroupId("");
                          setSelectedProductId("");
                          setProductFilter("");
                        }}
                        className="h-8 px-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <ShoppingBasket className="h-4 w-4 text-green-600" />
                        2. Selecione o Produto
                      </CardTitle>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Grupo:{" "}
                      {
                        groups.find((g) => g.id.toString() === selectedGroupId)
                          ?.name
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      placeholder="Buscar produto..."
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="h-10"
                    />
                    {loading ? (
                      <p className="text-center text-slate-500 py-4">
                        Carregando produtos...
                      </p>
                    ) : filteredProducts.length === 0 ? (
                      <p className="text-center text-slate-500 py-4">
                        Nenhum produto encontrado
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <SelectableCard
                            key={product.id}
                            id={product.id.toString()}
                            name={product.name}
                            isSelected={
                              selectedProductId === product.id.toString()
                            }
                            onSelect={handleSelectProduct}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Stock Status */}
              {selectedProductId && stockInfo !== null && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${stockInfo.quantity > 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
                >
                  {stockInfo.quantity > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {stockInfo.quantity > 0
                        ? `Em estoque: ${stockInfo.quantity} ${stockInfo.unit}`
                        : "Produto não encontrado no estoque principal"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Você pode prosseguir mesmo sem estoque registrado.
                    </p>
                  </div>
                  <Badge
                    variant={stockInfo.quantity > 0 ? "default" : "outline"}
                    className={stockInfo.quantity > 0 ? "bg-green-600" : ""}
                  >
                    {stockInfo.quantity > 0 ? "OK" : "Indisponível"}
                  </Badge>
                </div>
              )}

              {/* Product Form - Show only when a product is selected */}
              {selectedProductId && (
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProductId("")}
                        className="h-8 px-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        📋 3. Informações da Etiqueta
                      </CardTitle>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Produto:{" "}
                      {
                        products.find(
                          (p) => p.id.toString() === selectedProductId,
                        )?.name
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-manufacturing">
                          Dt. Fabricação *
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
                        <Label htmlFor="product-expiry">Dt. Validade *</Label>
                        <Input
                          id="product-expiry"
                          type="date"
                          className="h-12"
                          value={productExpiryDate}
                          onChange={(e) => setProductExpiryDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-opening">Dt. Abertura</Label>
                        <Input
                          id="product-opening"
                          type="date"
                          className="h-12"
                          value={productOpeningDate}
                          onChange={(e) =>
                            setProductOpeningDate(e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="product-expiry-after-opening">
                          Validade após Abertura
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
                    <div className="space-y-3">
                      <Label>Modo de Conservação *</Label>
                      <div className="grid grid-cols-3 gap-3">
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
                      <Label htmlFor="product-responsible">Responsável *</Label>
                      <Select
                        value={productResponsible}
                        onValueChange={setProductResponsible}
                        required
                      >
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem
                              key={member.id}
                              value={member.user.name}
                            >
                              {member.user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Fixed Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3 z-10 shadow-lg md:static md:bg-transparent md:border-none md:shadow-none md:p-4 md:mt-4">
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
          disabled={saving || !isFormValid()}
        >
          <Printer className="h-5 w-5" /> Salvar e Imprimir
        </Button>
      </div>
    </div>
  );
}
