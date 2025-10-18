import { supabase } from '../supabaseClient';
import { Etiqueta, EtiquetaCreate, Grupo, Produto } from '../../types/etiquetas';

export class EtiquetaService {
  // Buscar todos os grupos
  static async getGrupos(): Promise<Grupo[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Buscar produtos por grupo
  static async getProdutosByGrupo(grupoId: number): Promise<Produto[]> {
    const { data, error} = await supabase
      .from('products')
      .select('*')
      .eq('group_id', grupoId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Criar nova etiqueta
  static async createEtiqueta(etiqueta: EtiquetaCreate, userId: string): Promise<Etiqueta> {
    if (!userId) throw new Error('Usuário não autenticado');

    // Buscar organização do usuário
    const { data: userOrg } = await supabase
      .from('usuarios_organizacoes')
      .select('organizacao_id')
      .eq('usuario_id', userId)
      .eq('ativo', true)
      .single();

    if (!userOrg) throw new Error('Usuário não está associado a uma organização');

    const { data, error } = await supabase
      .from('etiquetas')
      .insert({
        product_id: etiqueta.product_id || etiqueta.produto_id,
        grupo_id: etiqueta.grupo_id,
        quantidade: etiqueta.quantidade,
        observacoes: etiqueta.observacoes,
        user_id: userId,
        organizacao_id: userOrg.organizacao_id,
        data_impressao: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Buscar etiquetas do usuário
  static async getEtiquetas(userId: string): Promise<Etiqueta[]> {
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('etiquetas')
      .select(`
        *,
        products!inner(name),
        groups!inner(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}
