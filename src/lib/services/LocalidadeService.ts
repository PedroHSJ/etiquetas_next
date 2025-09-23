import { supabase } from '../supabaseClient';
import { ViaCEPResponse, DadosMunicipio, MunicipioResponse, Estado, Municipio } from '../../types/localidade';

export class LocalidadeService {
  // Cache para evitar múltiplas consultas à API
  private static cepCache = new Map<string, ViaCEPResponse>();

  /**
   * Busca dados do CEP na API ViaCEP
   */
  static async buscarCEP(cep: string): Promise<ViaCEPResponse | null> {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '');
      
      // Valida formato do CEP
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      // Verifica cache
      if (this.cepCache.has(cepLimpo)) {
        return this.cepCache.get(cepLimpo)!;
      }

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data: ViaCEPResponse = await response.json();

      // Verifica se o CEP foi encontrado
      if (data.erro) {
        return null;
      }

      // Adiciona ao cache
      this.cepCache.set(cepLimpo, data);
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw new Error('Erro ao consultar CEP');
    }
  }

  /**
   * Busca ou cria um município baseado no CEP
   */
  static async buscarOuCriarMunicipio(cep: string): Promise<MunicipioResponse | null> {
    try {
      const dadosCEP = await this.buscarCEP(cep);
      
      if (!dadosCEP) {
        return null;
      }

      // Chama a função do banco de dados para buscar ou criar o município
      const { data, error } = await supabase.rpc('buscar_ou_criar_municipio', {
        p_nome: dadosCEP.localidade,
        p_uf: dadosCEP.uf,
        p_codigo_ibge: dadosCEP.ibge || null,
        p_cep: cep.replace(/\D/g, ''),
        p_latitude: null, // ViaCEP não fornece coordenadas
        p_longitude: null
      });

      if (error) {
        console.error('Erro ao buscar/criar município:', error);
        throw new Error('Erro ao processar município');
      }

      // A função agora retorna JSON com os dados completos
      return data as MunicipioResponse;
    } catch (error) {
      console.error('Erro ao buscar ou criar município:', error);
      throw error;
    }
  }

  /**
   * Lista todos os estados
   */
  static async listarEstados(): Promise<Estado[]> {
    try {
      console.log('🔍 LocalidadeService: Iniciando busca por estados...');
      
      const { data, error } = await supabase
        .from('estados')
        .select('*')
        .order('nome');

      console.log('🔍 LocalidadeService: Resposta da consulta:', { data, error });

      if (error) {
        console.error('❌ LocalidadeService: Erro na consulta:', error);
        throw error;
      }

      console.log(`✅ LocalidadeService: ${data?.length || 0} estados encontrados`);
      return data || [];
    } catch (error) {
      console.error('❌ LocalidadeService: Erro ao listar estados:', error);
      throw new Error('Erro ao carregar estados');
    }
  }

  /**
   * Lista municípios de um estado
   */
  static async listarMunicipiosPorEstado(estadoId: number): Promise<Municipio[]> {
    try {
      const { data, error } = await supabase
        .from('municipios')
        .select(`
          *,
          estado:estados(*)
        `)
        .eq('estado_id', estadoId)
        .order('nome');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao listar municípios:', error);
      throw new Error('Erro ao carregar municípios');
    }
  }

  /**
   * Busca um município pelo ID
   */
  static async buscarMunicipioPorId(municipioId: number): Promise<Municipio | null> {
    try {
      const { data, error } = await supabase
        .from('municipios')
        .select(`
          *,
          estado:estados(*)
        `)
        .eq('id', municipioId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Município não encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar município:', error);
      throw new Error('Erro ao carregar município');
    }
  }

  /**
   * Busca municípios por nome (autocomplete)
   */
  static async buscarMunicipiosPorNome(nome: string, estadoId?: number): Promise<Municipio[]> {
    try {
      let query = supabase
        .from('municipios')
        .select(`
          *,
          estado:estados(*)
        `)
        .ilike('nome', `%${nome}%`)
        .limit(20)
        .order('nome');

      if (estadoId) {
        query = query.eq('estado_id', estadoId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar municípios por nome:', error);
      throw new Error('Erro ao buscar municípios');
    }
  }

  /**
   * Valida formato do CEP
   */
  static validarCEP(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }

  /**
   * Formata CEP para exibição
   */
  static formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
    }
    return cep;
  }

  /**
   * Limpa o cache de CEPs
   */
  static limparCache(): void {
    this.cepCache.clear();
  }
}