"use client";

import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EntradaRapidaRequest, ProdutoSelect, ESTOQUE_MESSAGES } from "@/types/estoque";
import { useEffect } from "react";

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
  produtoIdSelecionado 
}: EntradaRapidaDialogProps) {
  const [open, setOpen] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoSelect[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [enviando, setEnviando] = useState(false);

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
      if (termo) params.append('q', termo);
      params.append('limit', '50');

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
      const request: EntradaRapidaRequest = {
        produto_id: parseInt(data.produto_id),
        quantidade: parseFloat(data.quantidade),
        observacao: data.observacao,
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
        toast.success(result.message || ESTOQUE_MESSAGES.ENTRADA_SUCESSO);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={carregandoProdutos}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carregandoProdutos ? (
                        <SelectItem value="loading" disabled>
                          Carregando produtos...
                        </SelectItem>
                      ) : produtos.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum produto encontrado
                        </SelectItem>
                      ) : (
                        produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id.toString()}>
                            {produto.nome} 
                            {produto.estoque_atual !== undefined && (
                              <span className="text-muted-foreground ml-2">
                                (Estoque: {produto.estoque_atual})
                              </span>
                            )}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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