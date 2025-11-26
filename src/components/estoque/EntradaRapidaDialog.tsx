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

const quickEntrySchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantity must be greater than zero",
    }),
  unitOfMeasure: z.string().min(1, "Select a unit of measure"),
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

const getUnitLabel = (unit?: string | null) => {
  if (!unit) return null;
  const option = UNIT_OF_MEASURE_OPTIONS.find((opt) => opt.value === unit);
  return option?.label || unit;
};

// Hooks customizados para React Query
const useProducts = (searchTerm = "", enabled = true) => {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organizationId || undefined;

  return useQuery({
    queryKey: ["products", { search: searchTerm, organizationId }],
    queryFn: () =>
      StockService.listProducts({
        q: searchTerm,
        limit: 50,
        organizationId: organizationId!,
      }),
    enabled: enabled && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

const useQuickEntry = () => {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organizationId || undefined;
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
    activeProfile?.userOrganization?.organizationId || undefined;
  const [open, setOpen] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const form = useForm<QuickEntryFormData>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      productId: selectedProductId ? selectedProductId.toString() : "",
      quantity: "",
      unitOfMeasure: "un", // Valor padrão
      observation: "",
    },
  });

  // React Query hooks
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(
    "",
    open
  );
  const quickEntryMutation = useQuickEntry();

  const selectedProductIdValue = form.watch("productId");
  const selectedProduct = useMemo(() => {
    const id = parseInt(selectedProductIdValue || "", 10);
    if (!id) return undefined;
    return products.find((product: ProductOption) => product.id === id);
  }, [products, selectedProductIdValue]);

  // Atualizar unidade quando produto mudar
  useEffect(() => {
    if (selectedProduct?.unit_of_measure_code) {
      form.setValue("unitOfMeasure", selectedProduct.unit_of_measure_code);
    }
  }, [selectedProduct, form]);

  useEffect(() => {
    if (selectedProductId) {
      form.setValue("productId", selectedProductId.toString());
    }
  }, [selectedProductId, form]);

  useEffect(() => {
    if (open && !organizationId) {
      // ainda permite listar produtos globais se organização não estiver selecionada
      return;
    }
  }, [open, organizationId]);

  const onSubmit = async (data: QuickEntryFormData) => {
    try {
      const request: QuickEntryRequest = {
        productId: parseInt(data.productId),
        quantity: parseFloat(data.quantity),
        unit_of_measure_code: data.unitOfMeasure as UnitOfMeasureCode,
        observation: data.observation,
        organizationId,
      };

      const result = await quickEntryMutation.mutateAsync(request);

      toast.success(result.message || STOCK_UI_MESSAGES.ENTRY_SUCCESS);
      form.reset({
        productId: "",
        quantity: "",
        unitOfMeasure: "un",
        observation: "",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error while recording stock entry:", error);
      toast.error("Error while recording stock entry");
    }
  };

  const isSubmitting = quickEntryMutation.isPending;

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <PlusCircle className="h-4 w-4" />
      Quick Entry
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Stock Entry</DialogTitle>
          <DialogDescription>
            Register product entries quickly to keep your stock updated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>

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
                              (p) => p.id.toString() === (field.value ?? "")
                            );
                            return selected ? (
                              <span>
                                {selected.name}
                                {selected.current_stock !== undefined && (
                                  <span className="text-muted-foreground ml-2">
                                    (Stock: {selected.current_stock})
                                  </span>
                                )}
                              </span>
                            ) : (
                              "Select a product"
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
                          placeholder="Filter products..."
                          autoFocus
                          className="w-full"
                        />

                        <CommandList
                          className="max-h-72 overflow-y-auto overscroll-contain"
                          onWheelCapture={(e) => e.stopPropagation()}
                        >
                          <CommandEmpty>No products found</CommandEmpty>

                          {isLoadingProducts ? (
                            <CommandItem disabled value="loading">
                              Loading products...
                            </CommandItem>
                          ) : (
                            (() => {
                              const byGroup: Record<string, ProductOption[]> =
                                {};
                              const groupNames: Record<string, string> = {};

                              for (const p of products) {
                                const gid = p.group_id
                                  ? String(p.group_id)
                                  : "No group";
                                (byGroup[gid] ||= []).push(p);
                                if (p?.group?.name)
                                  groupNames[gid] = p.group.name ?? "";
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
                                              "bg-accent text-accent-foreground"
                                          )}
                                        >
                                          {p.name}
                                          <Check
                                            className={cn(
                                              "ml-auto",
                                              isSelected
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                )
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
                    <FormLabel>Quantity *</FormLabel>
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
                    <FormLabel>Unit *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
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
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes about this entry (optional)"
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Record Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
