import { useState, useCallback } from "react";
import { OrganizationTemplate } from "@/types/organization";
import { getTemplate } from "@/config/organization-templates";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface UANData {
  // Informações Básicas
  cnpj?: string;
  tipo_uan?: 'restaurante_comercial' | 'restaurante_institucional' | 'lanchonete' | 'padaria' | 'cozinha_industrial' | 'catering' | 'outro';
  capacidade_atendimento?: number;
  data_inauguracao?: string;
  descricao?: string;
  
  // Localização
  estado_id?: number;
  municipio_id?: number;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  endereco_completo?: string;
  latitude?: number;
  longitude?: number;
  
  // Contato
  telefone_principal?: string;
  telefone_secundario?: string;
  email?: string;
}

interface WizardData {
  organizationName: string;
  organizationType: string;
  selectedDepartments: Array<{ nome: string; tipo: string }>;
  customDepartments: Array<{ nome: string; tipo: string }>;
  template: OrganizationTemplate | null;
  uanData: UANData;
}

interface UseOrganizationWizardReturn {
  currentStep: number;
  wizardData: WizardData;
  isLoading: boolean;
  nextStep: () => void;
  prevStep: () => void;
  updateWizardData: (data: Partial<WizardData>) => void;
  submitWizard: (
    userId: string
  ) => Promise<{ success: boolean; organizationId?: string }>;
  getTotalSteps: () => number;
}

export const useOrganizationWizard = (): UseOrganizationWizardReturn => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    organizationName: "",
    organizationType: "uan",
    selectedDepartments: [],
    customDepartments: [],
    template: getTemplate("uan"),
    uanData: {},
  });

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const updateWizardData = useCallback((data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  }, []);

  const submitWizard = useCallback(
    async (
      userId: string
    ): Promise<{ success: boolean; organizationId?: string }> => {
      setIsLoading(true);
      try {
        console.log("Iniciando criação da organização...", {
          nome: wizardData.organizationName,
          tipo: wizardData.organizationType,
          user_id: userId,
        });

        // 1. Criar organização (UUID será gerado automaticamente)
        const { data: orgData, error: orgError } = await supabase
          .from("organizacoes")
          .insert({
            nome: wizardData.organizationName,
            tipo: wizardData.organizationType,
            user_id: userId,
            // Dados UAN
            ...wizardData.uanData,
          })
          .select()
          .single();

        if (orgError) {
          console.error("Erro ao criar organização:", orgError);
          throw new Error(`Erro ao criar organização: ${orgError.message}`);
        }

        console.log("Organização criada:", orgData);

        // 2. Criar departamentos
        const allDepartments = [
          ...wizardData.selectedDepartments,
          ...wizardData.customDepartments,
        ];

        if (allDepartments.length > 0) {
          const departmentInserts = allDepartments.map((dept) => ({
            nome: dept.nome,
            organizacao_id: orgData.id,
            tipo_departamento: dept.tipo,
          }));

          console.log("Inserindo departamentos:", departmentInserts);

          const { data: deptData, error: deptError } = await supabase
            .from("departamentos")
            .insert(departmentInserts)
            .select();

          if (deptError) {
            console.error("Erro ao criar departamentos:", deptError);
            throw new Error(
              `Erro ao criar departamentos: ${deptError.message}`
            );
          }

          console.log("Departamentos criados:", deptData);
        }

        // 3. Buscar ID do perfil gestor
        const { data: gestorPerfil, error: perfilError } = await supabase
          .from("perfis")
          .select("id")
          .ilike("nome", "gestor")
          .single();

        if (perfilError || !gestorPerfil) {
          console.error("Erro ao buscar perfil gestor:", perfilError);
          throw new Error("Erro ao buscar perfil gestor");
        }

        // 4. Adicionar usuário como gestor da organização
        const { data: userOrgData, error: userOrgError } = await supabase
          .from("usuarios_organizacoes")
          .insert({
            usuario_id: userId,
            organizacao_id: orgData.id,
            perfil_id: gestorPerfil.id,
            ativo: true,
          })
          .select()
          .single();

        if (userOrgError || !userOrgData) {
          console.error(
            "Erro ao adicionar usuário à organização:",
            userOrgError
          );
          throw new Error(
            `Erro ao adicionar usuário à organização: ${userOrgError?.message}`
          );
        }

        // 5. Criar registro em usuarios_perfis
        const { error: userPerfilError } = await supabase
          .from("usuarios_perfis")
          .insert({
            usuario_organizacao_id: userOrgData.id,
            perfil_usuario_id: gestorPerfil.id,
            ativo: true,
          });

        if (userPerfilError) {
          console.error(
            "Erro ao criar perfil do usuário:",
            userPerfilError
          );
          throw new Error(
            `Erro ao criar perfil do usuário: ${userPerfilError.message}`
          );
        }

        console.log("Usuário adicionado como gestor da organização");

        toast.success("Organização configurada com sucesso!");
        return { success: true, organizationId: orgData.id };
      } catch (error) {
        console.error("Erro completo ao criar organização:", error);
        toast.error(
          `Erro ao configurar organização: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [wizardData]
  );

  const getTotalSteps = useCallback(() => {
    // Passo 1: Nome da UAN + Dados UAN completos
    // Passo 2: Departamentos
    // Passo 3: Resumo
    return 3;
  }, []);

  return {
    currentStep,
    wizardData,
    isLoading,
    nextStep,
    prevStep,
    updateWizardData,
    submitWizard,
    getTotalSteps,
  };
};
