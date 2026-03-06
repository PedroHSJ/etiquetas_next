import { prisma } from "@/lib/prisma";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@/types/dto/organization/request";
import { OrganizationExpandedResponseDto } from "@/types/dto/organization/response";
import { Prisma, organizations } from "@prisma/client";

/**
 * Service layer used by the API routes to manage organizations using Prisma.
 * Updated to return DTOs directly and handle date transformations.
 */
export class OrganizationBackendService {
  constructor() {}

  private mapExpandedOrganization(
    org: Prisma.organizationsGetPayload<{
      include: {
        states: true;
        cities: {
          include: {
            states: true;
          };
        };
      };
    }>,
  ): OrganizationExpandedResponseDto {
    return {
      id: org.id,
      name: org.name,
      type: org.type,
      createdBy: org.createdBy,
      createdAt:
        org.createdAt instanceof Date
          ? org.createdAt.toISOString()
          : String(org.createdAt),
      updatedAt:
        org.updatedAt instanceof Date
          ? org.updatedAt.toISOString()
          : String(org.updatedAt),
      cnpj: org.cnpj,
      capacity: org.capacity,
      openingDate: org.openingDate
        ? org.openingDate instanceof Date
          ? org.openingDate.toISOString()
          : String(org.openingDate)
        : null,
      fullAddress: org.fullAddress,
      zipCode: org.zipCode,
      district: org.district,
      latitude: org.latitude ? Number(org.latitude) : null,
      longitude: org.longitude ? Number(org.longitude) : null,
      mainPhone: org.mainPhone,
      altPhone: org.altPhone,
      institutionalEmail: org.institutionalEmail,
      stateId: org.stateId,
      cityId: org.cityId,
      address: org.address,
      number: org.number,
      addressComplement: org.addressComplement,
      state: org.states
        ? {
            id: org.states.id,
            code: org.states.code,
            name: org.states.name,
            region: org.states.region,
          }
        : undefined,
      city: org.cities
        ? {
            id: org.cities.id,
            name: org.cities.name,
            ibgeCode: org.cities.ibgeCode,
            state: org.cities.states
              ? {
                  id: org.cities.states.id,
                  code: org.cities.states.code,
                  name: org.cities.states.name,
                }
              : undefined,
          }
        : undefined,
    };
  }

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

  async createOrganization(
    data: CreateOrganizationDto,
    userId: string,
  ): Promise<organizations> {
    const entity = await prisma.organizations.create({
      data: {
        name: data.name,
        type: data.type,
        cnpj: data.cnpj?.replace(/\D/g, ""),
        capacity: data.capacity ? Number(data.capacity) : null,
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
        stateId: data.stateId ? Number(data.stateId) : null,
        cityId: data.cityId ? Number(data.cityId) : null,
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

  async updateOrganization(
    id: string,
    data: UpdateOrganizationDto,
  ): Promise<organizations> {
    const updateData: Prisma.organizationsUpdateInput = {
      ...data,
    };

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
  async getByIdExpanded(id: string): Promise<OrganizationExpandedResponseDto> {
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

    return this.mapExpandedOrganization(org);
  }

  /**
   * Update organization and return expanded data
   */
  async updateExpanded(
    id: string,
    data: UpdateOrganizationDto,
  ): Promise<OrganizationExpandedResponseDto> {
    await this.updateOrganization(id, data);
    return this.getByIdExpanded(id);
  }

  /**
   * Get all organizations for a user with expanded state/city
   */
  async listByUserIdExpanded(
    userId: string,
  ): Promise<OrganizationExpandedResponseDto[]> {
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

    return list.map((org) => this.mapExpandedOrganization(org));
  }
}
