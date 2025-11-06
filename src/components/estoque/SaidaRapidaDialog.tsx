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
import { Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ESTOQUE_MESSAGES } from "@/types/estoque";
import { useEffect } from "react";
import {
  MovimentacaoEstoqueService,
  type MovimentacaoEstoqueRequest,
  type ProdutoComEstoque,
} from "@/lib/services/movimentacaoEstoqueService";

// Schema de validação
const saidaRapidaSchema = z.object({
  produto_id: z.string().min(1, "Selecione um produto"),
  quantidade: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantidade deve ser um número maior que zero",
    }),
  observacao: z.string().optional(),
});

type SaidaRapidaFormData = z.infer<typeof saidaRapidaSchema>;

interface SaidaRapidaDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  produtoIdSelecionado?: number;
}

export function SaidaRapidaDialog({
  onSuccess,
  trigger,
  produtoIdSelecionado,
}: SaidaRapidaDialogProps) {
  const [open, setOpen] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoComEstoque[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const form = useForm<SaidaRapidaFormData>({
    resolver: zodResolver(saidaRapidaSchema),
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
      // Para saída, carregar apenas produtos com estoque > 0
      const produtos = await MovimentacaoEstoqueService.listarProdutos(
        termo,
        50,
        true
      );
      setProdutos(produtos);
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

  const onSubmit = async (data: SaidaRapidaFormData) => {
    setEnviando(true);
    try {
      // Validar quantidade
      const produtoSelecionado = produtos.find(
        (p) => p.id === parseInt(data.produto_id)
      );
      const estoqueAtual =
        produtoSelecionado?.estoque_atual ||
        produtoSelecionado?.current_quantity ||
        0;

      const validacao = MovimentacaoEstoqueService.validarQuantidade(
        parseFloat(data.quantidade),
        estoqueAtual
      );

      if (!validacao.valida) {
        toast.error(validacao.erro || "Erro na validação");
        setEnviando(false);
        return;
      }

      const request: MovimentacaoEstoqueRequest = {
        produto_id: parseInt(data.produto_id),
        quantidade: parseFloat(data.quantidade),
        observacao: data.observacao,
      };

      const result = await MovimentacaoEstoqueService.registrarSaida(request);

      if (result.success) {
        toast.success(result.message || ESTOQUE_MESSAGES.SAIDA_SUCESSO);
        form.reset();
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Erro ao registrar saída");
      }
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao registrar saída";
      toast.error(errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2" variant="destructive">
      <Minus className="h-4 w-4" />
      Saída Rápida
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Saída Rápida de Estoque</DialogTitle>
          <DialogDescription>
            Registre uma saída de produtos do estoque de forma rápida.
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
                      {produtos.map((produto) => (
                        <SelectItem
                          key={produto.id}
                          value={produto.id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <span>{produto.name}</span>
                            {(produto.estoque_atual !== undefined ||
                              produto.current_quantity !== undefined) && (
                              <span className="text-xs text-muted-foreground">
                                (Est:{" "}
                                {produto.estoque_atual ||
                                  produto.current_quantity ||
                                  0}
                                )
                              </span>
                            )}
                          </div>
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
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.000"
                      step="0.001"
                      min="0"
                      {...field}
                      disabled={enviando}
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
                  <FormLabel>Observação (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite uma observação sobre a saída..."
                      {...field}
                      disabled={enviando}
                      rows={3}
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
              <Button
                type="submit"
                disabled={enviando}
                variant="destructive"
                className="gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4" />
                    Registrar Saída
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
