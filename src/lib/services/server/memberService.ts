import { prisma } from "@/lib/prisma";

/**
 * Backend service for managing organization members.
 * Converters removed to return Prisma objects directly with inclusions.
 */
export class MemberBackendService {
  /**
   * Lists members linked to a specific organization.
   */
  async listMembersByOrganization(organizationId: string): Promise<any[]> {
    if (!organizationId) {
      throw new Error("Organization id is required");
    }

    return prisma.user_organizations.findMany({
      where: {
        organizationId,
      },
      include: {
        profiles: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
