import { api } from "@/lib/apiClient";
import { LocationService } from "./localidade-service";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@/types/dto/organization/request";
import {
  OrganizationResponseDto,
  OrganizationExpandedResponseDto,
} from "@/types/dto/organization/response";
import {
  validateCNPJ,
  formatCNPJ,
  formatPhone,
} from "@/lib/utils/organization";
import { ApiResponse } from "@/types/common";

export const OrganizationService = {
  /**
   * Get organization by ID with expanded state/city
   */
  async getOrganizationByIdExpanded(
    id: string,
  ): Promise<OrganizationExpandedResponseDto> {
    const { data } = await api.get<
      ApiResponse<OrganizationExpandedResponseDto>
    >(`/organization/expanded/${id}`);

    if (!data.data) {
      throw new Error("Organization not found");
    }

    return data.data;
  },

  /**
   * Update organization and return expanded data
   */
  async updateOrganizationExpanded(
    id: string,
    update: UpdateOrganizationDto,
  ): Promise<OrganizationExpandedResponseDto> {
    const { data } = await api.put<
      ApiResponse<OrganizationExpandedResponseDto>
    >(`/organization/expanded/${id}`, update);

    if (!data.data) {
      throw new Error("Failed to update organization");
    }

    return data.data;
  },

  /**
   * Get all organizations for a user with expanded state/city
   */
  async getOrganizationsByUserIdExpanded(
    userId: string,
  ): Promise<OrganizationExpandedResponseDto[]> {
    const { data } = await api.get<
      ApiResponse<OrganizationExpandedResponseDto[]>
    >(`/organization/expanded/user/${userId}`);

    if (!data.data) {
      throw new Error("No organizations found");
    }

    return data.data;
  },

  async getOrganizations(): Promise<OrganizationResponseDto[]> {
    const { data } =
      await api.get<ApiResponse<OrganizationResponseDto[]>>("/organization");

    if (!data.data) {
      throw new Error("Não foi possível carregar as organizações");
    }

    return data.data;
  },

  async createOrganization(
    organization: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const { data } = await api.post<ApiResponse<OrganizationResponseDto>>(
      "/organization",
      organization,
    );

    if (!data.data) {
      throw new Error("Erro ao criar organização");
    }

    return data.data;
  },

  /**
   * Setup completo de organização (organization + departments + user link)
   * Usado no wizard de onboarding
   */
  async setupOrganization(params: {
    organization: CreateOrganizationDto;
    departments?: Array<{ name: string; departmentType: string }>;
    managerProfileId: string;
  }): Promise<{ organizationId: string; departmentsCreated: number }> {
    const { data } = await api.post<
      ApiResponse<{ organizationId: string; departmentsCreated: number }>
    >("/organization/setup", {
      ...params.organization,
      departments: params.departments,
      managerProfileId: params.managerProfileId,
    });

    if (!data.data) {
      throw new Error("Erro ao configurar organização");
    }

    return data.data;
  },

  async processarCEP(cep: string) {
    try {
      const municipioResponse = await LocationService.fetchOrCreateCity(cep);

      if (!municipioResponse) {
        throw new Error("CEP não encontrado");
      }

      // Busca dados adicionais do CEP
      const dadosCEP = await LocationService.fetchCEP(cep);

      return {
        municipio: municipioResponse,
        endereco: dadosCEP?.logradouro || "",
        bairro: dadosCEP?.bairro || "",
        cep: LocationService.formatCEP(cep),
      };
    } catch (error) {
      console.error("Erro ao processar CEP:", error);
      throw error;
    }
  },

  // Validar CEP (delegado para LocalidadeService)
  async validarCEP(cep: string) {
    try {
      const dadosCEP = await LocationService.fetchCEP(cep);

      if (!dadosCEP) {
        throw new Error("CEP não encontrado");
      }

      return {
        cep: cep.replace(/\D/g, ""),
        endereco_completo: `${dadosCEP.logradouro}, ${dadosCEP.bairro}`,
        bairro: dadosCEP.bairro,
        cidade: dadosCEP.localidade,
        estado: dadosCEP.uf,
      };
    } catch (error) {
      console.error("Erro ao validar CEP:", error);
      throw error;
    }
  },

  // Validar CNPJ
  validarCNPJ(cnpj: string): boolean {
    return validateCNPJ(cnpj);
  },

  // Formatar CNPJ
  formatarCNPJ(cnpj: string): string {
    return formatCNPJ(cnpj);
  },

  // Formatar telefone
  formatarTelefone(telefone: string): string {
    return formatPhone(telefone);
  },

  // Formatar CEP (delegado para LocalidadeService)
  formatarCEP(cep: string): string {
    return LocationService.formatCEP(cep);
  },
};
