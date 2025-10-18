import { useState, useCallback } from "react";
import { LocalidadeService } from "@/lib/services/LocalidadeService";
import { Estado, Municipio, ViaCEPResponse } from "@/types/localidade";
import { useToast } from "./use-toast";

export function useLocalidade() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  // Carregar estados
  const carregarEstados = useCallback(async () => {
    try {
      setLoading(true);
      const estadosData = await LocalidadeService.listarEstados();
      setEstados(estadosData);
      return estadosData;
    } catch (error) {
      toast.error("Erro ao carregar estados");
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar municípios por estado
  const carregarMunicipiosPorEstado = useCallback(
    async (estadoId: number) => {
      try {
        setLoading(true);
        const municipiosData = await LocalidadeService.listarMunicipiosPorEstado(estadoId);
        setMunicipios(municipiosData);
        return municipiosData;
      } catch (error) {
        toast.error("Erro ao carregar municípios");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Buscar municípios por nome
  const buscarMunicipiosPorNome = useCallback(
    async (nome: string, estadoId?: number) => {
      try {
        setLoading(true);
        const municipiosData = await LocalidadeService.buscarMunicipiosPorNome(nome, estadoId);
        return municipiosData;
      } catch (error) {
        toast.error("Erro ao buscar municípios");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Buscar por CEP
  const buscarCEP = useCallback(
    async (cep: string): Promise<ViaCEPResponse | null> => {
      try {
        setLoading(true);

        if (!LocalidadeService.validarCEP(cep)) {
          toast.error("CEP inválido - Digite um CEP válido com 8 dígitos");
          return null;
        }

        const dadosCEP = await LocalidadeService.buscarCEP(cep);

        if (!dadosCEP) {
          toast.error("CEP não encontrado - Verifique se o CEP está correto");
          return null;
        }

        return dadosCEP;
      } catch (error) {
        toast.error("Erro ao buscar CEP");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Buscar ou criar município por CEP
  const buscarOuCriarMunicipioPorCEP = useCallback(
    async (cep: string) => {
      try {
        setLoading(true);

        if (!LocalidadeService.validarCEP(cep)) {
          toast.error("CEP inválido - Digite um CEP válido com 8 dígitos");
          return null;
        }

        const municipioResponse = await LocalidadeService.buscarOuCriarMunicipio(cep);

        if (!municipioResponse) {
          toast.error("CEP não encontrado - Verifique se o CEP está correto");
          return null;
        }

        // Buscar dados completos do CEP
        const dadosCEP = await LocalidadeService.buscarCEP(cep);

        toast.success(
          `CEP encontrado! ${municipioResponse.nome} - ${municipioResponse.estado.codigo}`
        );

        return {
          municipio: municipioResponse,
          dadosCEP,
        };
      } catch (error) {
        toast.error("Erro ao processar CEP");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Validar e formatar CEP
  const validarCEP = useCallback((cep: string): boolean => {
    return LocalidadeService.validarCEP(cep);
  }, []);

  const formatarCEP = useCallback((cep: string): string => {
    return LocalidadeService.formatarCEP(cep);
  }, []);

  // Limpar cache
  const limparCache = useCallback(() => {
    LocalidadeService.limparCache();
  }, []);

  return {
    // Estados
    estados,
    municipios,
    loading,

    // Funções
    carregarEstados,
    carregarMunicipiosPorEstado,
    buscarMunicipiosPorNome,
    buscarCEP,
    buscarOuCriarMunicipioPorCEP,

    // Utilitários
    validarCEP,
    formatarCEP,
    limparCache,
  };
}
