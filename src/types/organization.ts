export interface OrganizationType {
    id: string;
    nome: string;
    tipo: 'uan';
    created_at: string;
    user_id: string;
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