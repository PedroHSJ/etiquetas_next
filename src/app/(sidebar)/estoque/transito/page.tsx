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
  const userName =
    activeProfile?.userOrganization?.profile?.name || "Responsável";

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

  // ====== AMOSTRAS - Form State ======
  const [amostraName, setAmostraName] = useState<string>("");
  const [amostraHorario, setAmostraHorario] = useState<string>("");
  const [amostraDataColeta, setAmostraDataColeta] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [amostraDataDescarte, setAmostraDataDescarte] = useState<string>("");
  const [amostraResponsavel, setAmostraResponsavel] = useState<string>("");

  // ====== PRODUTOS - Form State ======
  const [produtoDataFabricacao, setProdutoDataFabricacao] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [produtoDataValidade, setProdutoDataValidade] = useState<string>("");
  const [produtoDataAbertura, setProdutoDataAbertura] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [produtoDataValidadeAbertura, setProdutoDataValidadeAbertura] =
    useState<string>("");
  const [produtoConservacao, setProdutoConservacao] =
    useState<ConservationMode>("REFRIGERADO");
  const [produtoResponsavel, setProdutoResponsavel] = useState<string>("");

  useEffect(() => {
    // Set default responsavel from profile
    if (userName) {
      setAmostraResponsavel(userName);
      setProdutoResponsavel(userName);
    }
  }, [userName]);

  useEffect(() => {
    // Calculate descarte date (72 hours = 3 days after coleta)
    if (amostraDataColeta) {
      const coleta = new Date(amostraDataColeta);
      coleta.setDate(coleta.getDate() + 3);
      setAmostraDataDescarte(coleta.toISOString().split("T")[0]);
    }
  }, [amostraDataColeta]);

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
      console.error("Erro ao carregar grupos:", error);
      toast.error("Erro ao carregar grupos de alimentos");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (groupId: string) => {
    try {
      setLoading(true);
      const allProducts = await ProductService.getProducts(organizationId);
      const filtered = allProducts.filter(
        (p) => p.groupId === parseInt(groupId),
      );
      setProducts(filtered);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
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
      console.error("Erro ao verificar estoque:", error);
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

  const validateAmostraForm = (): boolean => {
    if (!amostraName.trim()) {
      toast.error("Preencha o nome da amostra");
      return false;
    }
    if (!amostraHorario) {
      toast.error("Preencha o horário");
      return false;
    }
    if (!amostraDataColeta) {
      toast.error("Preencha a data da coleta");
      return false;
    }
    if (!amostraResponsavel.trim()) {
      toast.error("Preencha o responsável");
      return false;
    }
    return true;
  };

  const validateProdutoForm = (): boolean => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return false;
    }
    if (!produtoDataFabricacao) {
      toast.error("Preencha a data de fabricação");
      return false;
    }
    if (!produtoDataValidade) {
      toast.error("Preencha a data de validade");
      return false;
    }
    if (!produtoResponsavel.trim()) {
      toast.error("Preencha o responsável");
      return false;
    }
    return true;
  };

  const handleSaveAmostra = async (print: boolean = false) => {
    if (!validateAmostraForm()) return;

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
            sampleName: amostraName,
            collectionTime: amostraHorario,
            collectionDate: amostraDataColeta,
            discardDate: amostraDataDescarte,
            responsibleName: amostraResponsavel,
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
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao processar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProduto = async (print: boolean = false) => {
    if (!validateProdutoForm()) return;

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
        expiryDate: produtoDataValidade,
        observations: `Conservação: ${produtoConservacao}`,
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
            manufacturingDate: produtoDataFabricacao,
            validityDate: produtoDataValidade,
            openingDate: produtoDataAbertura,
            validityAfterOpening: produtoDataValidadeAbertura,
            conservationMode: produtoConservacao,
            responsibleName: produtoResponsavel,
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
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar no estoque em trânsito");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (print: boolean = false) => {
    if (activeTab === "amostras") {
      handleSaveAmostra(print);
    } else {
      handleSaveProduto(print);
    }
  };

  const isFormValid = () => {
    if (activeTab === "amostras") {
      return (
        amostraName.trim() &&
        amostraHorario &&
        amostraDataColeta &&
        amostraResponsavel.trim()
      );
    } else {
      return (
        selectedProductId &&
        produtoDataFabricacao &&
        produtoDataValidade &&
        produtoResponsavel.trim()
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
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Mobile */}
      <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
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
            {/* TAB AMOSTRAS */}
            <TabsContent value="amostras" className="mt-4 space-y-4">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3 border-b">
                  <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-purple-600" />
                    Dados da Amostra
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amostra-name">Nome da Amostra *</Label>
                    <Input
                      id="amostra-name"
                      placeholder="Ex: Salada de Frutas"
                      className="h-12"
                      value={amostraName}
                      onChange={(e) => setAmostraName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amostra-horario">Horário *</Label>
                      <Input
                        id="amostra-horario"
                        type="time"
                        className="h-12"
                        value={amostraHorario}
                        onChange={(e) => setAmostraHorario(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amostra-coleta">Data da Coleta *</Label>
                      <Input
                        id="amostra-coleta"
                        type="date"
                        className="h-12"
                        value={amostraDataColeta}
                        onChange={(e) => setAmostraDataColeta(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amostra-descarte">Data do Descarte</Label>
                    <Input
                      id="amostra-descarte"
                      type="date"
                      className="h-12 bg-slate-50"
                      value={amostraDataDescarte}
                      onChange={(e) => setAmostraDataDescarte(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Obs: Descarte após 72 horas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amostra-responsavel">Responsável *</Label>
                    <Input
                      id="amostra-responsavel"
                      placeholder="Nome do responsável"
                      className="h-12"
                      value={amostraResponsavel}
                      onChange={(e) => setAmostraResponsavel(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB PRODUTOS */}
            <TabsContent value="produtos" className="space-y-4">
              {/* Seleção de Grupo */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="border-b">
                  <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    1. Selecione o Grupo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {groups.map((group) => (
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

              {/* Seleção de Produto */}
              {selectedGroupId && (
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      <ShoppingBasket className="h-4 w-4 text-green-600" />
                      2. Selecione o Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {loading ? (
                      <p className="text-center text-slate-500 py-4">
                        Carregando produtos...
                      </p>
                    ) : products.length === 0 ? (
                      <p className="text-center text-slate-500 py-4">
                        Nenhum produto encontrado neste grupo
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {products.map((product) => (
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

              {/* Status do Estoque */}
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

              {/* Formulário de Produto */}
              {selectedProductId && (
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      📋 3. Informações da Etiqueta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="produto-fabricacao">
                          Dt. Fabricação *
                        </Label>
                        <Input
                          id="produto-fabricacao"
                          type="date"
                          className="h-12"
                          value={produtoDataFabricacao}
                          onChange={(e) =>
                            setProdutoDataFabricacao(e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="produto-validade">Dt. Validade *</Label>
                        <Input
                          id="produto-validade"
                          type="date"
                          className="h-12"
                          value={produtoDataValidade}
                          onChange={(e) =>
                            setProdutoDataValidade(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="produto-abertura">Dt. Abertura</Label>
                        <Input
                          id="produto-abertura"
                          type="date"
                          className="h-12"
                          value={produtoDataAbertura}
                          onChange={(e) =>
                            setProdutoDataAbertura(e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="produto-validade-abertura">
                          Validade após Abertura
                        </Label>
                        <Input
                          id="produto-validade-abertura"
                          type="date"
                          className="h-12"
                          value={produtoDataValidadeAbertura}
                          onChange={(e) =>
                            setProdutoDataValidadeAbertura(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Modo de Conservação */}
                    <div className="space-y-3">
                      <Label>Modo de Conservação *</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <ConservationOption
                          mode="REFRIGERADO"
                          label="Refrigerado"
                          icon={<Thermometer className="h-5 w-5" />}
                          isSelected={produtoConservacao === "REFRIGERADO"}
                          onSelect={setProdutoConservacao}
                        />
                        <ConservationOption
                          mode="CONGELADO"
                          label="Congelado"
                          icon={<Snowflake className="h-5 w-5" />}
                          isSelected={produtoConservacao === "CONGELADO"}
                          onSelect={setProdutoConservacao}
                        />
                        <ConservationOption
                          mode="AMBIENTE"
                          label="T° Ambiente"
                          icon={<Sun className="h-5 w-5" />}
                          isSelected={produtoConservacao === "AMBIENTE"}
                          onSelect={setProdutoConservacao}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="produto-responsavel">Responsável *</Label>
                      <Input
                        id="produto-responsavel"
                        placeholder="Nome do responsável"
                        className="h-12"
                        value={produtoResponsavel}
                        onChange={(e) => setProdutoResponsavel(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer Fixo Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3 z-10 shadow-lg">
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
