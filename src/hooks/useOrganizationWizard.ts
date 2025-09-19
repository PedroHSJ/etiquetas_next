import { useState, useCallback } from "react";
import { OrganizationTemplate } from "@/types/organization";
import { getTemplate } from "@/config/organization-templates";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface WizardData {
  organizationName: string;
  organizationType: string;
  selectedDepartments: Array<{ nome: string; tipo: string }>;
  customDepartments: Array<{ nome: string; tipo: string }>;
  template: OrganizationTemplate | null;
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
  });

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const totalSteps =
        wizardData.template &&
        Object.keys(wizardData.template.especializacoes).length > 0
          ? 4
          : 3;

      let nextStep = prev + 1;

      // Se estamos no passo 2 e não há especializações, pular para o passo 4 (resumo)
      if (prev === 2 && totalSteps === 3) {
        nextStep = 4;
      }

      return Math.min(nextStep, totalSteps === 3 ? 4 : 4);
    });
  }, [wizardData.template]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const hasSpecializations =
        wizardData.template &&
        Object.keys(wizardData.template.especializacoes).length > 0;

      let prevStep = prev - 1;

      // Se estamos no passo 4 (resumo) e não há especializações, voltar para o passo 2
      if (prev === 4 && !hasSpecializations) {
        prevStep = 2;
      }

      return Math.max(prevStep, 1);
    });
  }, [wizardData.template]);

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
    // Sempre 3 passos para UANs (sem especializações)
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
