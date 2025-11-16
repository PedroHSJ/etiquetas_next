/**
 * Response DTOs for Department operations
 */

export interface DepartmentResponseDto {
  id: string;
  name: string;
  organizationId: string;
  departmentType: string | null;
  createdAt: string;
}

export interface DepartmentWithOrganizationResponseDto
  extends DepartmentResponseDto {
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
}
