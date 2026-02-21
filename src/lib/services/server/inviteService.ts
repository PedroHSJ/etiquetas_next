import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import {
  AcceptInviteDto,
  CreateInviteDto,
  InviteWithRelationsResponseDto,
  ListInvitesDto,
} from "@/types/dto/invite";

type CreateInviteWithMetadata = CreateInviteDto & {
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  invitedByAvatarUrl?: string | null;
};

/**
 * Service layer for invite management (backend)
 */
export class InviteBackendService {
  /**
   * List invites with filters
   */
  async listInvites(
    options: ListInvitesDto = {},
  ): Promise<InviteWithRelationsResponseDto[]> {
    const { email, status, organizationId } = options;

    const where: any = {};
    if (email) where.email = email;
    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;

    const invitesList = await prisma.invites.findMany({
      where,
      include: {
        organizations: true,
        profiles: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitesList.map((inv: any) => ({
      ...inv,
      organization: inv.organizations,
      profile: inv.profiles
        ? {
            ...inv.profiles,
            createdAt: inv.profiles.createdAt.toISOString(),
          }
        : undefined,
      expiresAt: inv.expiresAt?.toISOString() || "",
      createdAt: inv.createdAt?.toISOString() || "",
      acceptedAt: inv.acceptedAt?.toISOString() || null,
      rejectedAt: inv.rejectedAt?.toISOString() || null,
    }));
  }

  /**
   * Get pending invites for an email
   */
  async getPendingInvites(
    email: string,
  ): Promise<InviteWithRelationsResponseDto[]> {
    const invitesList = await prisma.invites.findMany({
      where: {
        email,
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organizations: true,
        profiles: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitesList.map((inv: any) => ({
      ...inv,
      organization: inv.organizations,
      profile: inv.profiles
        ? {
            ...inv.profiles,
            createdAt: inv.profiles.createdAt.toISOString(),
          }
        : undefined,
      expiresAt: inv.expiresAt?.toISOString() || "",
      createdAt: inv.createdAt?.toISOString() || "",
      acceptedAt: inv.acceptedAt?.toISOString() || null,
      rejectedAt: inv.rejectedAt?.toISOString() || null,
    }));
  }

  /**
   * Create a new invite
   */
  async createInvite(
    inviteData: CreateInviteWithMetadata,
  ): Promise<InviteWithRelationsResponseDto> {
    const inviteToken =
      crypto?.randomUUID?.() ||
      Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const newInvite = await prisma.invites.create({
      data: {
        email: inviteData.email,
        organizationId: inviteData.organizationId,
        profileId: inviteData.profileId,
        inviteToken: inviteToken,
        expiresAt: expiresAt,
        invitedBy: inviteData.invitedBy,
        invitedByName: inviteData.invitedByName,
        invitedByEmail: inviteData.invitedByEmail,
        invitedByAvatarUrl: inviteData.invitedByAvatarUrl,
        status: "pending",
      },
      include: {
        organizations: true,
        profiles: true,
      },
    });

    return {
      ...(newInvite as any),
      organization: (newInvite as any).organizations,
      profile: (newInvite as any).profiles
        ? {
            ...(newInvite as any).profiles,
            createdAt: (newInvite as any).profiles.createdAt.toISOString(),
          }
        : undefined,
      expiresAt: newInvite.expiresAt?.toISOString() || "",
      createdAt: newInvite.createdAt?.toISOString() || "",
      acceptedAt: newInvite.acceptedAt?.toISOString() || null,
      rejectedAt: newInvite.rejectedAt?.toISOString() || null,
    };
  }

  /**
   * Accept an invite
   */
  async acceptInvite(acceptData: AcceptInviteDto): Promise<boolean> {
    const { inviteToken, userId } = acceptData;

    await prisma.$transaction(async (tx) => {
      // 1. Fetch valid invite
      const invite = await tx.invites.findFirst({
        where: {
          inviteToken: inviteToken,
          status: "pending",
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!invite) {
        throw new Error("Invite not found or expired");
      }

      // 2. Update invite status to accepted
      await tx.invites.update({
        where: { id: invite.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
          acceptedBy: userId,
        },
      });

      // 3. Create user_organizations
      const userOrg = await tx.user_organizations.create({
        data: {
          userId: userId,
          organizationId: invite.organizationId,
          profileId: invite.profileId,
          active: true,
          entryDate: new Date(),
        },
      });

      // 4. Create user_profiles
      await tx.user_profiles.create({
        data: {
          userOrganizationId: userOrg.id,
          profileId: invite.profileId,
          active: true,
          startDate: new Date(),
        },
      });
    });

    return true;
  }

  /**
   * Reject an invite
   */
  async rejectInvite(inviteId: string, userId?: string): Promise<boolean> {
    await prisma.invites.update({
      where: { id: inviteId },
      data: {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: userId,
      },
    });
    return true;
  }

  /**
   * Cancel an invite
   */
  async cancelInvite(inviteId: string): Promise<boolean> {
    await prisma.invites.update({
      where: { id: inviteId },
      data: {
        status: "canceled",
      },
    });
    return true;
  }
}
