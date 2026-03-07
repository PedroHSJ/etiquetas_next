import { prisma } from "@/lib/prisma";
import { permissions, profiles, functionalities } from "@prisma/client";
import {
  FunctionalityResponseDto,
  PermissionResponseDto,
  ProfileResponseDto,
  UserPermissionsResponseDto,
} from "@/types/dto/profile/response";

/**
 * Backend service for permission management
 * Updated to use camelCase Prisma fields.
 */
export class PermissionBackendService {
  private mapProfileToDto(entity: profiles): ProfileResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      active: entity.active ?? false,
      createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private mapFunctionalityToDto(
    entity: functionalities,
  ): FunctionalityResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      code: entity.code,
      active: entity.active ?? false,
      createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private mapPermissionToDto(
    entity: permissions & {
      functionalities?: functionalities | null;
      profiles?: profiles | null;
    },
  ): PermissionResponseDto {
    return {
      id: entity.id,
      functionalityId: entity.functionalityId,
      profileId: entity.profileId,
      action: entity.action,
      active: entity.active ?? false,
      createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
      functionality: entity.functionalities
        ? this.mapFunctionalityToDto(entity.functionalities)
        : undefined,
      profile: entity.profiles
        ? this.mapProfileToDto(entity.profiles)
        : undefined,
    };
  }

  /**
   * Checks if a user has permission for a specific action
   */
  async hasPermission(
    functionalityName: string,
    action: string,
    userId: string,
    organizationId: string,
  ): Promise<boolean | null> {
    try {
      const usuarioOrg = await prisma.user_organizations.findFirst({
        where: {
          userId,
          organizationId,
          active: true,
        },
        include: {
          user_profiles: {
            include: {
              profiles: true,
            },
          },
        },
      });

      if (!usuarioOrg) {
        return false;
      }

      for (const userProfile of usuarioOrg.user_profiles) {
        const profile = userProfile.profiles;
        if (profile.name === "master") {
          return true;
        }

        const perms = await prisma.permissions.findMany({
          where: {
            profileId: profile.id,
            active: true,
            action: action,
            functionalities: {
              name: functionalityName,
            },
          },
          include: {
            functionalities: true,
          },
        });

        if (perms.length > 0) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }
  }

  async getUserPermissions(
    userId: string,
    organizationId: string,
  ): Promise<UserPermissionsResponseDto | null> {
    const usuarioOrg = await prisma.user_organizations.findFirst({
      where: {
        userId,
        organizationId,
        active: true,
      },
    });

    if (!usuarioOrg) {
      return null;
    }

    const userProfiles = await prisma.user_profiles.findMany({
      where: {
        userOrganizationId: usuarioOrg.id,
        active: true,
      },
      include: {
        profiles: true,
      },
    });

    const profileIds = userProfiles.map((up) => up.profiles.id);

    const perms = await prisma.permissions.findMany({
      where: {
        profileId: { in: profileIds },
        active: true,
      },
      include: {
        functionalities: true,
        profiles: true,
      },
    });

    return {
      userId,
      organizationId,
      permissions: perms.map((permission) => this.mapPermissionToDto(permission)),
      profiles: userProfiles.map((up) => this.mapProfileToDto(up.profiles)),
    };
  }

  async getUserProfiles(
    userId: string,
    organizationId: string,
  ): Promise<profiles[]> {
    const usuarioOrg = await prisma.user_organizations.findFirst({
      where: {
        userId,
        organizationId,
        active: true,
      },
      include: {
        user_profiles: {
          include: {
            profiles: true,
          },
        },
      },
    });

    if (!usuarioOrg) {
      return [];
    }

    return usuarioOrg.user_profiles.map((up) => up.profiles);
  }

  async getFunctionalities(): Promise<functionalities[]> {
    const funcs = await prisma.functionalities.findMany();

    return funcs;
  }

  async getPermissions(): Promise<PermissionResponseDto[]> {
    const perms = await prisma.permissions.findMany({
      where: { active: true },
      include: {
        functionalities: true,
        profiles: true,
      },
      orderBy: [{ functionalityId: "asc" }, { action: "asc" }],
    });

    return perms.map((permission) => this.mapPermissionToDto(permission));
  }

  /**
   * Checks if profile has permission
   */
  async updateProfilePermissions(
    functionalityName: string,
    action: string,
    userId: string,
    organizationId: string,
  ): Promise<boolean | null> {
    return this.hasPermission(
      functionalityName,
      action,
      userId,
      organizationId,
    );
  }

  /**
   * Assigns a user profile to a user
   */
  async assignProfileToUser(
    userOrganizationId: string,
    profileId: string,
  ): Promise<boolean> {
    try {
      const existing = await prisma.user_profiles.findFirst({
        where: {
          userOrganizationId,
          profileId,
        },
      });

      if (existing) {
        await prisma.user_profiles.update({
          where: { id: existing.id },
          data: {
            active: true,
            startDate: new Date(),
          },
        });
      } else {
        await prisma.user_profiles.create({
          data: {
            userOrganizationId,
            profileId,
            active: true,
            startDate: new Date(),
          },
        });
      }
      return true;
    } catch (error: unknown) {
      console.error(
        "Erro ao atribuir perfil ao usuário:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  /**
   * Removes a user profile from a user
   */
  async removeProfileFromUser(
    userOrganizationId: string,
    profileId: string,
  ): Promise<boolean> {
    try {
      await prisma.user_profiles.updateMany({
        where: {
          userOrganizationId,
          profileId,
        },
        data: {
          active: false,
        },
      });
      return true;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erro ao remover perfil do usuário",
      );
    }
  }
}
