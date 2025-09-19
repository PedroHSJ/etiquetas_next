export interface OrganizationType {
    id: string;
    nome: string;
    tipo: 'uan';
    created_at: string;
    // Removido user_id pois agora usamos usuarios_organizacoes
    user_perfil?: {
      nome: string;
      descricao: string;
    };
    data_entrada?: string;
  }

export interface OrganizationTemplate {
departamentos: Array<{
    nome: string;
    tipo: string;
}>;
especializacoes: Record<string, string[]>;
terminologia: {
    organizacao: string;
    departamento: string;
    especializacao: string;
    integrante: string;
};
}