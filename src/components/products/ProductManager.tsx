"use client";

import React, { useState } from "react";
import {
  Product,
  ProductCategory,
  UNIT_OF_MEASURE_OPTIONS,
} from "@/lib/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Barcode,
  Thermometer,
  Calendar,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  unit_of_measure: string;
  brand: string;
  supplier: string;
  barcode: string;
  internal_code: string;
  shelf_life_days: string;
  storage_temperature: string;
  allergens: string;
}

interface ProductManagerProps {
  products?: Product[];
  categories?: ProductCategory[];
  onSaveProduct?: (product: Partial<Product>) => void;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products = [],
  categories = [],
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    unit_of_measure: "un",
    brand: "",
    supplier: "",
    barcode: "",
    internal_code: "",
    shelf_life_days: "",
    storage_temperature: "",
    allergens: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory && product.is_active;
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category,
        unit_of_measure: product.unit_of_measure,
        brand: product.brand || "",
        supplier: product.supplier || "",
        barcode: product.barcode || "",
        internal_code: product.internal_code || "",
        shelf_life_days: product.shelf_life_days?.toString() || "",
        storage_temperature: product.storage_temperature || "",
        allergens: product.allergens?.join(", ") || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        category: "",
        unit_of_measure: "un",
        brand: "",
        supplier: "",
        barcode: "",
        internal_code: "",
        shelf_life_days: "",
        storage_temperature: "",
        allergens: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    if (!formData.category) {
      toast.error("Categoria é obrigatória");
      return;
    }

    const productData: Partial<Product> = {
      id: editingProduct?.id,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      unit_of_measure: formData.unit_of_measure as any,
      brand: formData.brand.trim() || undefined,
      supplier: formData.supplier.trim() || undefined,
      barcode: formData.barcode.trim() || undefined,
      internal_code: formData.internal_code.trim() || undefined,
      shelf_life_days: formData.shelf_life_days
        ? parseInt(formData.shelf_life_days)
        : undefined,
      storage_temperature: formData.storage_temperature.trim() || undefined,
      allergens: formData.allergens
        ? formData.allergens
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : undefined,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (!editingProduct) {
      productData.created_at = new Date().toISOString();
    }

    onSaveProduct?.(productData);
    setIsDialogOpen(false);
    toast.success(editingProduct ? "Produto atualizado!" : "Produto criado!");
  };

  const handleDelete = (productId: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      onDeleteProduct?.(productId);
      toast.success("Produto excluído!");
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || "#6b7280";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de produtos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Frango Inteiro"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unit">Unidade de Medida *</Label>
                <Select
                  value={formData.unit_of_measure}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, unit_of_measure: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  placeholder="Ex: Perdigão"
                />
              </div>

              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplier: e.target.value,
                    }))
                  }
                  placeholder="Ex: Distribuidora ABC"
                />
              </div>

              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      barcode: e.target.value,
                    }))
                  }
                  placeholder="Ex: 7891234567890"
                />
              </div>

              <div>
                <Label htmlFor="internal_code">Código Interno</Label>
                <Input
                  id="internal_code"
                  value={formData.internal_code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      internal_code: e.target.value,
                    }))
                  }
                  placeholder="Ex: PROD001"
                />
              </div>

              <div>
                <Label htmlFor="shelf_life">Validade (dias)</Label>
                <Input
                  id="shelf_life"
                  type="number"
                  value={formData.shelf_life_days}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shelf_life_days: e.target.value,
                    }))
                  }
                  placeholder="Ex: 30"
                />
              </div>

              <div>
                <Label htmlFor="temperature">
                  Temperatura de Armazenamento
                </Label>
                <Input
                  id="temperature"
                  value={formData.storage_temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      storage_temperature: e.target.value,
                    }))
                  }
                  placeholder="Ex: 0°C a 4°C"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="allergens">
                  Alérgenos (separados por vírgula)
                </Label>
                <Input
                  id="allergens"
                  value={formData.allergens}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allergens: e.target.value,
                    }))
                  }
                  placeholder="Ex: Glúten, Lactose, Soja"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingProduct ? "Atualizar" : "Criar"} Produto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:w-64">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.name}
                  </CardTitle>
                  {product.brand && (
                    <p className="text-sm text-gray-600 mt-1">
                      {product.brand}
                    </p>
                  )}
                </div>
                <Badge
                  style={{
                    backgroundColor: getCategoryColor(product.category),
                    color: "white",
                  }}
                  className="ml-2"
                >
                  {product.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                  <Package className="w-3 h-3" />
                  {
                    UNIT_OF_MEASURE_OPTIONS.find(
                      (u) => u.value === product.unit_of_measure
                    )?.label
                  }
                </div>

                {product.shelf_life_days && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                    <Calendar className="w-3 h-3" />
                    {product.shelf_life_days} dias
                  </div>
                )}

                {product.storage_temperature && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                    <Thermometer className="w-3 h-3" />
                    {product.storage_temperature}
                  </div>
                )}

                {product.barcode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                    <Barcode className="w-3 h-3" />
                    Código
                  </div>
                )}
              </div>

              {product.allergens && product.allergens.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-red-600">Alérgenos: </span>
                  <span className="text-red-500">
                    {product.allergens.join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDialog(product)}
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando seu primeiro produto"}
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
