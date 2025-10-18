import { useState, useEffect, useCallback } from "react";
import { EtiquetaService } from "@/lib/services/etiquetaService";
import { Grupo, Produto, Etiqueta, EtiquetaCreate } from "@/types/etiquetas";
import { useAuth } from "@/contexts/AuthContext";

export function useEtiquetas() {
  const { userId } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar grupos
  const loadGrupos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const gruposData = await EtiquetaService.getGrupos();
      setGrupos(gruposData);
    } catch (err) {
      setError("Erro ao carregar grupos");
      console.error("Erro ao carregar grupos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar produtos por grupo
  const loadProdutosByGrupo = useCallback(async (grupoId: number) => {
    try {
      setLoading(true);
      setError(null);
      const produtosData = await EtiquetaService.getProdutosByGrupo(grupoId);
      setProdutos(produtosData);
    } catch (err) {
      setError("Erro ao carregar produtos do grupo");
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar etiqueta
  const createEtiqueta = useCallback(
    async (etiquetaData: EtiquetaCreate): Promise<Etiqueta> => {
      try {
        setLoading(true);
        setError(null);
        const novaEtiqueta = await EtiquetaService.createEtiqueta(etiquetaData, userId);

        // Adicionar à lista de etiquetas
        setEtiquetas((prev) => [novaEtiqueta, ...prev]);

        return novaEtiqueta;
      } catch (err) {
        setError("Erro ao criar etiqueta");
        console.error("Erro ao criar etiqueta:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Carregar etiquetas do usuário
  const loadEtiquetas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const etiquetasData = await EtiquetaService.getEtiquetas(userId);
      setEtiquetas(etiquetasData);
    } catch (err) {
      setError("Erro ao carregar etiquetas");
      console.error("Erro ao carregar etiquetas:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (userId) {
      loadGrupos();
      loadEtiquetas();
    }
  }, [loadGrupos, loadEtiquetas, userId]);

  return {
    grupos,
    produtos,
    etiquetas,
    loading,
    error,
    loadGrupos,
    loadProdutosByGrupo,
    createEtiqueta,
    loadEtiquetas,
    clearError,
  };
}
