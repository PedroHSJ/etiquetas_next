import { useState, useCallback } from "react";
import { CreateOrganizationDto } from "@/types/dto/organization/request";
import { OrganizationTemplate } from "@/types/models/organization";
import { getTemplate } from "@/config/organization-templates";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { OrganizationService } from "@/lib/services/client/organization-service";
import { TipoUAN } from "@/types/uan";

interface UANData {
  cnpj?: string;
  uanType?: TipoUAN;
  capacity?: number;
  openingDate?: string;
  description?: string;
  stateId?: number;
  cityId?: number;
  zipCode?: string;
  address?: string;
  number?: string;
  addressComplement?: string;
  district?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  mainPhone?: string;
  altPhone?: string;
  institutionalEmail?: string;
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
    userId: string,
    options?: SubmitWizardOptions,
  ) => Promise<{ success: boolean; organizationId?: string }>;
  getTotalSteps: () => number;
}

const sanitizeCnpj = (value?: string | null) => {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, 14) || undefined;
};

const buildOrganizationPayload = (
  wizardData: WizardData,
): CreateOrganizationDto => {
  const { uanData } = wizardData;

  return {
    name: wizardData.organizationName.trim(),
    type: wizardData.organizationType,
    cnpj: sanitizeCnpj(uanData.cnpj),
    capacity: uanData.capacity,
    openingDate: uanData.openingDate,
    fullAddress: uanData.fullAddress,
    zipCode: uanData.zipCode,
    district: uanData.district,
    latitude: uanData.latitude,
    longitude: uanData.longitude,
    mainPhone: uanData.mainPhone,
    altPhone: uanData.altPhone,
    institutionalEmail: uanData.institutionalEmail,
    stateId: uanData.stateId,
    cityId: uanData.cityId,
    address: uanData.address,
    number: uanData.number,
    addressComplement: uanData.addressComplement,
  };
};

interface SubmitWizardVariables {
  userId: string;
  wizardData: WizardData;
  managerProfileId: string;
}

interface SubmitWizardOptions {
  managerProfileId?: string;
}

export const useOrganizationWizard = (): UseOrganizationWizardReturn => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    organizationName: "",
    organizationType: "uan",
    selectedDepartments: [
      { nome: "Produção/Cozinha", tipo: "producao" },
      { nome: "Estoque/Almoxarifado", tipo: "estoque" },
      { nome: "Administrativo", tipo: "administrativo" },
    ],
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

  const createOrganizationMutation = useMutation<
    { organizationId: string; departmentsCreated: number },
    Error,
    SubmitWizardVariables
  >({
    mutationFn: async ({ wizardData, managerProfileId }) => {
      console.log("Starting organization setup...", {
        name: wizardData.organizationName,
        type: wizardData.organizationType,
      });

      if (!managerProfileId) {
        throw new Error("Perfil de gestor não informado");
      }

      // Preparar dados da organização
      const organizationPayload = buildOrganizationPayload(wizardData);

      // Preparar departments
      const allDepartments = [
        ...wizardData.selectedDepartments,
        ...wizardData.customDepartments,
      ];

      const departments = allDepartments.map((dept) => ({
        name: dept.nome,
        departmentType: dept.tipo,
      }));

      console.log("Calling setupOrganization with:", {
        organization: organizationPayload,
        departments,
        managerProfileId,
      });

      // Chama o serviço de frontend que chama a API
      const result = await OrganizationService.setupOrganization({
        organization: organizationPayload,
        departments: departments.length > 0 ? departments : undefined,
        managerProfileId,
      });

      console.log("Organization setup completed:", result);

      return result;
    },
  });

  const submitWizard = useCallback(
    async (
      userId: string,
      options?: SubmitWizardOptions,
    ): Promise<{ success: boolean; organizationId?: string }> => {
      if (!options?.managerProfileId) {
        toast.error("Não foi possível identificar o perfil de gestor.");
        return { success: false };
      }

      try {
        const result = await createOrganizationMutation.mutateAsync({
          userId,
          wizardData,
          managerProfileId: options.managerProfileId,
        });

        return { success: true, organizationId: result.organizationId };
      } catch (error) {
        throw new Error(
          `${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
      }
    },
    [createOrganizationMutation, wizardData],
  );

  const getTotalSteps = useCallback(() => {
    // Step 1: UAN basic data
    // Step 2: Departments
    // Step 3: Summary
    return 3;
  }, []);

  return {
    currentStep,
    wizardData,
    isLoading: createOrganizationMutation.isPending,
    nextStep,
    prevStep,
    updateWizardData,
    submitWizard,
    getTotalSteps,
  };
};
