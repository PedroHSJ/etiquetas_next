import { OrganizationTemplate } from "@/types/organization";

export const organizationTemplates: Record<string, OrganizationTemplate> = {
  uan: {
    departamentos: [
      { nome: "Produção/Cozinha", tipo: "producao" },
      { nome: "Nutrição", tipo: "nutricao" },
      { nome: "Estoque/Almoxarifado", tipo: "estoque" },
      { nome: "Higienização", tipo: "higienizacao" },
      { nome: "Atendimento/Distribuição", tipo: "atendimento" },
      { nome: "Administrativo", tipo: "administrativo" },
      { nome: "Manutenção", tipo: "manutencao" },
    ],
    especializacoes: {},
    terminologia: {
      organizacao: "UAN",
      departamento: "Setor",
      especializacao: "Especialização",
      integrante: "Funcionário",
    },
  },
};

export const getTemplate = (tipo: string): OrganizationTemplate => {
  return organizationTemplates[tipo] || organizationTemplates.uan;
};
