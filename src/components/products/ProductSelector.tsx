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
      <Package className="w-4 h-4 mr-2" />
      {selectedProduct ? selectedProduct.name : placeholder}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto encontrado</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Tente buscar com outros termos</p>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                    selectedProduct?.id === product.id &&
                      "border-blue-500 bg-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{product.name}</h3>
                        {selectedProduct?.id === product.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        {product.brand && (
                          <span className="font-medium">{product.brand}</span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {product.category?.name || 'Sem categoria'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.unit_of_measure || 'un'}
                        </Badge>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
