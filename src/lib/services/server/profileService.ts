import { prisma } from "@/lib/prisma";
import {
  ProfileResponseDto,
  UserProfileResponseDto,
} from "@/types/dto/profile/response";
import {
  profiles,
  user_profiles,
  user_organizations,
  organizations,
} from "@prisma/client";

interface ListProfilesOptions {
  search?: string;
  activeOnly?: boolean;
}

/**
 * Service layer for profile management
 */
export class ProfileBackendService {
  constructor() {}

  private slugify(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private mapProfileToDto(entity: profiles): ProfileResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      active: entity.active ?? false,
      createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
      slug: this.slugify(entity.name),
    };
  }

  private mapUserProfileToDto(entity: any): UserProfileResponseDto {
    return {
      id: entity.id,
      userOrganizationId: entity.userOrganizationId,
      profileId: entity.profileId,
      active: entity.active ?? false,
      startDate: entity.startDate?.toISOString() ?? new Date().toISOString(),
      createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
      profile: this.mapProfileToDto(entity.profiles),
      userOrganization: {
        organization: {
          ...entity.user_organizations.organizations,
          openingDate:
            entity.user_organizations.organizations.openingDate?.toISOString() ||
            null,
          createdAt:
            entity.user_organizations.organizations.createdAt.toISOString(),
          updatedAt:
            entity.user_organizations.organizations.updatedAt.toISOString(),
          latitude: entity.user_organizations.organizations.latitude
            ? Number(entity.user_organizations.organizations.latitude)
            : null,
          longitude: entity.user_organizations.organizations.longitude
            ? Number(entity.user_organizations.organizations.longitude)
            : null,
        },
      },
    };
  }

  /**
   * List all profiles with optional filters
   */
  async listProfiles(
    options: ListProfilesOptions = {},
  ): Promise<ProfileResponseDto[]> {
    const { search, activeOnly = true } = options;

    const where: any = {};

    if (activeOnly) {
      where.active = true;
    }

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const profilesList = await prisma.profiles.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return profilesList.map((entity) => this.mapProfileToDto(entity));
  }

  /**
   * Get profile by slug
   */
  async getProfileBySlug(slug: string): Promise<ProfileResponseDto | null> {
    if (!slug) {
      return null;
    }

    const normalizedSlug = this.slugify(slug);
    const profilesResult = await this.listProfiles({ activeOnly: true });

    return (
      profilesResult.find(
        (profile) => this.slugify(profile.name) === normalizedSlug,
      ) ?? null
    );
  }

  /**
   * Busca todos os perfis disponíveis para o usuário informado
   */
  async getAvailableProfiles(
    userId: string,
  ): Promise<UserProfileResponseDto[]> {
    try {
      const userProfilesList = await prisma.user_profiles.findMany({
        where: {
          active: true,
          user_organizations: {
            userId: userId,
          },
        },
        include: {
          profiles: true,
          user_organizations: {
            include: {
              organizations: true,
            },
          },
        },
      });

      return userProfilesList.map((item) => this.mapUserProfileToDto(item));
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      throw new Error("Erro ao buscar perfis do usuário");
    }
  }
}
