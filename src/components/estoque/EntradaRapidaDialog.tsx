"use client";

import { useRef, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Loader2, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { QuickEntryRequest, ProductSelect, STOCK_MESSAGES } from "@/types/stock";
import { useEffect } from "react";

// Backward compatibility aliases
import { ChevronsUpDown, Check } from "lucide-react";
import { CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";
type EntradaRapidaRequest = QuickEntryRequest;
type ProdutoSelect = ProductSelect;
const ESTOQUE_MESSAGES = STOCK_MESSAGES;

// Schema de validação
const entradaRapidaSchema = z.object({
  produto_id: z.string().min(1, "Selecione um produto"),
  quantidade: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantidade deve ser um número maior que zero",
    }),
  observacao: z.string().optional(),
});

type EntradaRapidaFormData = z.infer<typeof entradaRapidaSchema>;

interface EntradaRapidaDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  produtoIdSelecionado?: number;
}

export function EntradaRapidaDialog({
  onSuccess,
  trigger,
  produtoIdSelecionado,
}: EntradaRapidaDialogProps) {
  const [open, setOpen] = useState(false); // Dialog
  const [comboOpen, setComboOpen] = useState(false); // Popover do combobox
  const [produtos, setProdutos] = useState<ProdutoSelect[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Estado para filtro do combobox
  const [inputValue, setInputValue] = useState("");

  const form = useForm<EntradaRapidaFormData>({
    resolver: zodResolver(entradaRapidaSchema),
    defaultValues: {
      produto_id: produtoIdSelecionado ? produtoIdSelecionado.toString() : "",
      quantidade: "",
      observacao: "",
    },
  });

  // Carregar produtos ao abrir o dialog
  const carregarProdutos = async (termo = "") => {
    setCarregandoProdutos(true);
    try {
      const params = new URLSearchParams();
      if (termo) params.append("q", termo);
      params.append("limit", "50");

      const response = await fetch(`/api/estoque/produtos?${params}`);
      const data = await response.json();

      if (data.success) {
        setProdutos(data.data);
      } else {
        toast.error("Erro ao carregar produtos");
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setCarregandoProdutos(false);
    }
  };

  useEffect(() => {
    if (open) {
      carregarProdutos();
    }
  }, [open]);

  // Definir produto selecionado se foi passado como prop
  useEffect(() => {
    if (produtoIdSelecionado) {
      form.setValue("produto_id", produtoIdSelecionado.toString());
    }
  }, [produtoIdSelecionado, form]);

  const onSubmit = async (data: EntradaRapidaFormData) => {
    setEnviando(true);
    try {
      const request: QuickEntryRequest = {
        product_id: parseInt(data.produto_id),
        quantity: parseFloat(data.quantidade),
        observation: data.observacao,
      };

      // Utiliza fetchWithAuth para enviar o token JWT e cookies
      const { fetchWithAuth } = await import("@/lib/fetchWithAuth");
      const response = await fetchWithAuth("/api/estoque/entrada-rapida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || ESTOQUE_MESSAGES.ENTRY_SUCCESS);
        form.reset();
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Erro ao registrar entrada");
      }
    } catch (error) {
      console.error("Erro ao registrar entrada:", error);
      toast.error("Erro ao registrar entrada");
    } finally {
      setEnviando(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <PlusCircle className="h-4 w-4" />
      Entrada Rápida
    </Button>
  );

  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrada Rápida de Estoque</DialogTitle>
          <DialogDescription>
            Registre uma entrada de produtos no estoque de forma rápida.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="produto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto *</FormLabel>

                  <Popover open={comboOpen} onOpenChange={setComboOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          ref={triggerRef}
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboOpen}
                          className="w-full justify-between"
                          disabled={carregandoProdutos}
                        >
                          {(() => {
                            const selected = produtos.find(
                              (p) => p.id.toString() === (field.value ?? "")
                            );
                            return selected ? (
                              <span>
                                {selected.name}
                                {selected.current_stock !== undefined && (
                                  <span className="text-muted-foreground ml-2">
                                    (Estoque: {selected.current_stock})
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
                      className="min-w-[var(--radix-popover-trigger-width)] p-0"
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

                          {carregandoProdutos ? (
                            <CommandItem disabled value="loading">
                              Carregando produtos...
                            </CommandItem>
                          ) : (
                            (() => {
                              // Agrupamento permanece — o filtro será feito pelo Shadcn
                              const byGroup: Record<string, ProdutoSelect[]> = {};
                              const groupNames: Record<string, string> = {};

                              for (const p of produtos) {
                                const gid = p.group_id ? String(p.group_id) : "Sem grupo";
                                (byGroup[gid] ||= []).push(p);
                                if (p?.group?.name) groupNames[gid] = p.group.name ?? "";
                                else if (!groupNames[gid]) groupNames[gid] = gid;
                              }

                              return Object.entries(byGroup).map(([gid, list]) => (
                                <CommandGroup key={gid} heading={groupNames[gid] || gid}>
                                  {list.map((p) => {
                                    const idStr = p.id.toString();
                                    const isSelected = (field.value ?? "") === idStr;

                                    return (
                                      <CommandItem
                                        key={p.id}
                                        value={p.name.toString()}
                                        onSelect={() => {
                                          field.onChange(idStr);
                                          setComboOpen(false);
                                        }}
                                        className={cn(
                                          isSelected && "bg-accent text-accent-foreground"
                                        )}
                                      >
                                        {p.name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            isSelected ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              ));
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

            <FormField
              control={form.control}
              name="quantidade"
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
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a entrada (opcional)"
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
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Entrada
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
