// Database entity types for invites - Updated to camelCase for Prisma @map schema
export interface InviteEntity {
  id: string;
  email: string;
  organizationId: string;
  profileId: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "canceled";
  inviteToken: string;
  expiresAt: string;
  invitedBy: string;
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  invitedByAvatarUrl?: string | null;
  createdAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  canceledAt?: string;
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
  profile?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface InviteInviteWithRelationsEntity extends Omit<
  InviteEntity,
  "organization" | "profile"
> {
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
  profile?: {
    id: string;
    name: string;
    description?: string | null;
  };
}
