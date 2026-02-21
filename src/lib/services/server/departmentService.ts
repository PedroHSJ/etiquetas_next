import { prisma } from "@/lib/prisma";
import { departments } from "@prisma/client";

/**
 * Service layer used by the API routes to manage departments.
 * Updated to return DTOs directly and handle date transformations.
 */
export class DepartmentBackendService {
  constructor() {}

  async createDepartments(
    organizationId: string,
    departments: Array<{ name: string; departmentType: string }>,
  ): Promise<departments[]> {
    if (!departments || departments.length === 0) return [];

    const results = await prisma.$transaction(
      departments.map((dept) =>
        prisma.departments.create({
          data: {
            name: dept.name,
            organizationId: organizationId,
            departmentType: dept.departmentType,
          },
        }),
      ),
    );

    return results;
  }

  async listDepartments(
    params: {
      organizationId?: string;
      search?: string;
    } = {},
  ): Promise<departments[]> {
    const { organizationId, search } = params;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (search?.trim())
      where.name = { contains: search.trim(), mode: "insensitive" };

    const list = await prisma.departments.findMany({
      where,
      include: {
        organizations: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return list;
  }

  async getDepartmentById(id: string): Promise<departments | null> {
    const dept = await prisma.departments.findUnique({
      where: { id },
      include: {
        organizations: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return dept;
  }

  async createDepartment(data: {
    name: string;
    organizationId: string;
    departmentType?: string | null;
  }): Promise<departments> {
    const entity = await prisma.departments.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        departmentType: data.departmentType ?? null,
      },
    });

    return entity;
  }

  async updateDepartment(
    id: string,
    data: {
      name?: string;
      departmentType?: string | null;
    },
  ): Promise<departments> {
    const entity = await prisma.departments.update({
      where: { id },
      data: {
        name: data.name,
        departmentType: data.departmentType,
      },
    });

    return entity;
  }

  async deleteDepartment(id: string): Promise<void> {
    await prisma.departments.delete({ where: { id } });
  }

  async linkUserToOrganization(
    userId: string,
    organizationId: string,
    profileId: string,
  ): Promise<any> {
    return prisma.user_organizations.create({
      data: {
        userId,
        organizationId,
        profileId,
        active: true,
      },
    });
  }

  async createUserProfile(userOrganizationId: string, profileId: string) {
    await prisma.user_profiles.create({
      data: {
        userOrganizationId,
        profileId,
        active: true,
      },
    });
  }
}
