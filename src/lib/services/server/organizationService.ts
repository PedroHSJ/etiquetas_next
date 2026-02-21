import { prisma } from "@/lib/prisma";
import {
  OrganizationResponseDto,
  OrganizationExpandedResponseDto,
} from "@/types/dto/organization/response";
import { organizations } from "@prisma/client";

/**
 * Service layer used by the API routes to manage organizations using Prisma.
 * Updated to return DTOs directly and handle date transformations.
 */
export class OrganizationBackendService {
  constructor() {}

  /**
   * Returns every organization the user created OR belongs to.
   */
  async listByUserId(userId: string): Promise<organizations[]> {
    const list = await prisma.organizations.findMany({
      where: {
        OR: [
          { createdBy: userId },
          {
            user_organizations: {
              some: {
                userId,
                active: true,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return list;
  }

  async createOrganization(data: any, userId: string): Promise<organizations> {
    const entity = await prisma.organizations.create({
      data: {
        name: data.name,
        type: data.type,
        cnpj: data.cnpj?.replace(/\D/g, ""),
        capacity: data.capacity,
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
        stateId: data.stateId,
        cityId: data.cityId,
        zipCode: data.zipCode?.replace(/\D/g, ""),
        address: data.address,
        number: data.number,
        addressComplement: data.addressComplement,
        district: data.district,
        fullAddress: data.fullAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        mainPhone: data.mainPhone?.replace(/\D/g, ""),
        altPhone: data.altPhone?.replace(/\D/g, ""),
        institutionalEmail: data.institutionalEmail,
        createdBy: userId,
      },
    });

    return entity;
  }

  async updateOrganization(id: string, data: any): Promise<organizations> {
    const updateData: any = { ...data };

    // Clean numeric strings
    if (data.cnpj !== undefined)
      updateData.cnpj = data.cnpj?.replace(/\D/g, "");
    if (data.zipCode !== undefined)
      updateData.zipCode = data.zipCode?.replace(/\D/g, "");
    if (data.mainPhone !== undefined)
      updateData.mainPhone = data.mainPhone?.replace(/\D/g, "");
    if (data.altPhone !== undefined)
      updateData.altPhone = data.altPhone?.replace(/\D/g, "");

    // Handle dates
    if (data.openingDate !== undefined)
      updateData.openingDate = data.openingDate
        ? new Date(data.openingDate)
        : null;

    updateData.updatedAt = new Date();

    const entity = await prisma.organizations.update({
      where: { id },
      data: updateData,
    });

    return entity;
  }

  /**
   * Get organization by ID with expanded state/city
   */
  async getByIdExpanded(id: string): Promise<any> {
    const org = await prisma.organizations.findUnique({
      where: { id },
      include: {
        states: true,
        cities: {
          include: {
            states: true,
          },
        },
      },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    return org;
  }

  /**
   * Update organization and return expanded data
   */
  async updateExpanded(id: string, data: any): Promise<any> {
    await this.updateOrganization(id, data);
    return this.getByIdExpanded(id);
  }

  /**
   * Get all organizations for a user with expanded state/city
   */
  async listByUserIdExpanded(userId: string): Promise<any[]> {
    const list = await prisma.organizations.findMany({
      where: {
        OR: [
          { createdBy: userId },
          {
            user_organizations: {
              some: {
                userId,
                active: true,
              },
            },
          },
        ],
      },
      include: {
        states: true,
        cities: {
          include: {
            states: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return list;
  }
}
