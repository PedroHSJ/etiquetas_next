import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import {
  DepartmentResponseDto,
  DepartmentWithOrganizationResponseDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  ListDepartmentsDto,
} from "@/types/dto/department";

export const DepartmentService = {
  async getDepartments(
    params: ListDepartmentsDto = {},
  ): Promise<DepartmentWithOrganizationResponseDto[]> {
    const { data, status } = await api.get<
      ApiResponse<DepartmentWithOrganizationResponseDto[]>
    >("/departments", {
      params: {
        organizationId: params.organizationId || undefined,
        search: params.search || undefined,
      },
    });

    if (!data || !Array.isArray(data.data) || status !== 200) {
      return [];
    }

    return data.data;
  },

  async getDepartmentById(
    id: string,
  ): Promise<DepartmentWithOrganizationResponseDto | null> {
    const { data, status } = await api.get<
      ApiResponse<DepartmentWithOrganizationResponseDto>
    >(`/departments/${id}`);

    if (!data || !data.data || status !== 200) {
      return null;
    }

    return data.data;
  },

  async createDepartment(
    dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const { data, status } = await api.post<ApiResponse<DepartmentResponseDto>>(
      "/departments",
      dto,
    );

    if (!data || !data.data || (status !== 200 && status !== 201)) {
      throw new Error("Erro ao criar departamento");
    }

    return data.data;
  },

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const { data, status } = await api.put<ApiResponse<DepartmentResponseDto>>(
      `/departments/${id}`,
      dto,
    );

    if (!data || !data.data || status !== 200) {
      throw new Error("Erro ao atualizar departamento");
    }

    return data.data;
  },

  async deleteDepartment(id: string): Promise<boolean> {
    const { status } = await api.delete(`/departments/${id}`);
    return status === 200;
  },
};
