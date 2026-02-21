"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  QuickEntryRequest,
  ProductSelect,
  STOCK_MESSAGES,
  UnitOfMeasureCode,
} from "@/types/stock/stock";
import { StockService } from "@/lib/services/client/stock-service";
import { UNIT_OF_MEASURE_OPTIONS } from "@/types/stock/product";
import { cn } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";
import { useStorageLocationsQuery } from "@/hooks/useStorageLocationsQuery";

const quickEntrySchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "A quantidade deve ser maior que zero",
    }),
  unitOfMeasure: z.string().min(1, "Selecione a unidade de medida"),
  storageLocationId: z.string().optional(),
  observation: z.string().optional(),
});

type QuickEntryFormData = z.infer<typeof quickEntrySchema>;
type QuickEntryDialogProps = {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  selectedProductId?: number;
};
type ProductOption = ProductSelect;
const STOCK_UI_MESSAGES = STOCK_MESSAGES;

// Hooks customizados para React Query
const useProducts = (searchTerm = "", enabled = true) => {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || undefined;

  return useQuery({
    queryKey: ["products", { search: searchTerm, organizationId }],
    queryFn: () =>
      StockService.listProducts({
        q: searchTerm,
        limit: 500,
        organizationId: organizationId!,
      }),
    enabled: enabled && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

const useQuickEntry = () => {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || undefined;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: QuickEntryRequest) =>
      StockService.quickEntry({
        ...request,
        organizationId: organizationId!,
      }),
    onSuccess: () => {
      // Invalida queries relacionadas ao estoque
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] }); // Invalida estatísticas também
    },
  });
};

export function EntradaRapidaDialog({
  onSuccess,
  trigger,
  selectedProductId,
}: QuickEntryDialogProps) {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || undefined;
  const [open, setOpen] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const form = useForm<QuickEntryFormData>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      productId: selectedProductId ? selectedProductId.toString() : "",
      quantity: "",
      unitOfMeasure: "un", // Valor padrão
      storageLocationId: "",
      observation: "",
    },
  });

  // React Query hooks
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(
    "",
    open,
  );
  const { data: storageLocations = [], isLoading: isLoadingLocations } =
    useStorageLocationsQuery({
      organizationId,
      enabled: open && !!organizationId,
    });

  // Build location paths for display (e.g., "Rua 01 > Estante A > Caixa 01")
  const locationOptionsWithPath = useMemo(() => {
    const locationMap = new Map(storageLocations.map((loc) => [loc.id, loc]));

    const buildPath = (locationId: string): string => {
      const paths: string[] = [];
      let current = locationMap.get(locationId);
      while (current) {
        paths.unshift(current.name);
        current = current.parentId
          ? locationMap.get(current.parentId)
          : undefined;
      }
      return paths.join(" > ");
    };

    return storageLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      fullPath: buildPath(loc.id),
    }));
  }, [storageLocations]);

  const quickEntryMutation = useQuickEntry();

  const selectedProductIdValue = form.watch("productId");
  const selectedProduct = useMemo(() => {
    const id = parseInt(selectedProductIdValue || "", 10);
    if (!id) return undefined;
    return products.find((product: ProductOption) => product.id === id);
  }, [products, selectedProductIdValue]);

  // Atualizar unidade quando produto mudar
  useEffect(() => {
    if (selectedProduct?.unitOfMeasureCode) {
      form.setValue("unitOfMeasure", selectedProduct.unitOfMeasureCode);
    }
  }, [selectedProduct, form]);

  useEffect(() => {
    if (selectedProductId) {
      form.setValue("productId", selectedProductId.toString());
    }
  }, [selectedProductId, form]);

  const onSubmit = async (data: QuickEntryFormData) => {
    try {
      const request: QuickEntryRequest = {
        productId: parseInt(data.productId),
        quantity: parseFloat(data.quantity),
        unitOfMeasureCode: data.unitOfMeasure as UnitOfMeasureCode,
        storageLocationId: data.storageLocationId || undefined,
        observation: data.observation,
        organizationId,
      };

      const result = await quickEntryMutation.mutateAsync(request);

      toast.success(result.message || STOCK_UI_MESSAGES.ENTRY_SUCCESS);
      form.reset({
        productId: "",
        quantity: "",
        unitOfMeasure: "un",
        storageLocationId: "",
        observation: "",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error while recording stock entry:", error);
      toast.error("Erro ao registrar entrada de estoque");
    }
  };

  const isSubmitting = quickEntryMutation.isPending;

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <PlusCircle className="h-4 w-4" />
      Entrada rápida
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrada rápida de estoque</DialogTitle>
          <DialogDescription>
            Registre entradas de produtos rapidamente para manter seu estoque
            atualizado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto *</FormLabel>

                  <Popover
                    open={isComboboxOpen}
                    onOpenChange={setIsComboboxOpen}
                    modal={false}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isComboboxOpen}
                          className="w-full justify-between"
                          disabled={isLoadingProducts}
                        >
                          {(() => {
                            const selected = products.find(
                              (p) => p.id.toString() === (field.value ?? ""),
                            );
                            return selected ? (
                              <span>
                                {selected.name}
                                {selected.currentQuantity !== undefined && (
                                  <span className="text-muted-foreground ml-2">
                                    (Estoque: {selected.currentQuantity})
                                  </span>
                                )}
                              </span>
                            ) : (
                              "Selecione um produto"
                            );
                          })()}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      sideOffset={4}
                      className="p-0 min-w-[var(--radix-popover-trigger-width)]"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <Command className="w-full">
                        <CommandInput
                          placeholder="Filtrar produtos..."
                          autoFocus
                          className="w-full"
                        />

                        <CommandList
                          className="max-h-72 overflow-y-auto overscroll-contain"
                          onWheelCapture={(e) => e.stopPropagation()}
                        >
                          <CommandEmpty>Nenhum produto encontrado</CommandEmpty>

                          {isLoadingProducts ? (
                            <CommandItem disabled value="loading">
                              Carregando produtos...
                            </CommandItem>
                          ) : (
                            (() => {
                              const byGroup: Record<string, ProductOption[]> =
                                {};
                              const groupNames: Record<string, string> = {};

                              for (const p of products) {
                                const gid = p.groupId
                                  ? String(p.groupId)
                                  : "Sem grupo";
                                (byGroup[gid] ||= []).push(p);
                                if ((p as any).group?.name)
                                  groupNames[gid] = (p as any).group.name ?? "";
                                else if (!groupNames[gid])
                                  groupNames[gid] = gid;
                              }

                              return Object.entries(byGroup).map(
                                ([gid, list]) => (
                                  <CommandGroup
                                    key={gid}
                                    heading={groupNames[gid] || gid}
                                  >
                                    {list.map((p) => {
                                      const idStr = p.id.toString();
                                      const isSelected =
                                        (field.value ?? "") === idStr;

                                      return (
                                        <CommandItem
                                          key={p.id}
                                          value={p.name.toString()}
                                          onSelect={() => {
                                            field.onChange(idStr);
                                            setIsComboboxOpen(false);
                                          }}
                                          className={cn(
                                            isSelected &&
                                              "bg-accent text-accent-foreground",
                                          )}
                                        >
                                          {p.name}
                                          <Check
                                            className={cn(
                                              "ml-auto",
                                              isSelected
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                ),
                              );
                            })()
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="0.000"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storageLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização Física</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoadingLocations}>
                        <SelectValue placeholder="Selecione uma localização (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationOptionsWithPath.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.fullPath}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anotações sobre esta entrada (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Registrar entrada
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
