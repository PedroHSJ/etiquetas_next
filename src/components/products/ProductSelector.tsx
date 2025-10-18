import React, { useState } from "react";
import { Product } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  selectedProduct?: Product | null;
  onProductSelect: (product: Product) => void;
  trigger?: React.ReactNode;
  placeholder?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProduct,
  onProductSelect,
  trigger,
  placeholder = "Selecionar produto",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.is_active &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full justify-start">
      <Package className="mr-2 h-4 w-4" />
      {selectedProduct ? selectedProduct.name : placeholder}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Produto</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar por nome, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>Nenhum produto encontrado</p>
                {searchTerm && <p className="mt-1 text-sm">Tente buscar com outros termos</p>}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-all hover:bg-gray-50",
                    selectedProduct?.id === product.id && "border-blue-500 bg-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-medium">{product.name}</h3>
                        {selectedProduct?.id === product.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>

                      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                        {product.brand && <span className="font-medium">{product.brand}</span>}
                        <Badge variant="secondary" className="text-xs">
                          {product.category?.name || "Sem categoria"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.unit_of_measure || "un"}
                        </Badge>
                      </div>

                      {product.description && (
                        <p className="line-clamp-2 text-sm text-gray-500">{product.description}</p>
                      )}

                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        {product.shelf_life_days && (
                          <span>Validade: {product.shelf_life_days} dias</span>
                        )}
                        {product.storage_temperature && (
                          <span>Temp: {product.storage_temperature}</span>
                        )}
                        {product.barcode && <span>Cód: {product.barcode}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
