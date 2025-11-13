/**
 * Request DTOs for Department operations
 */

export interface CreateDepartmentDto {
  name: string;
  organizationId: string;
  departmentType?: string | null;
}

export interface UpdateDepartmentDto {
  name?: string;
  departmentType?: string | null;
}

export interface ListDepartmentsDto {
  organizationId?: string;
  search?: string;
}
