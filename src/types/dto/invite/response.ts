/**
 * Response DTOs for Invite operations
 */

export interface InviteResponseDto {
  id: string;
  email: string;
  organizationId: string;
  profileId: string;
  status: string;
  inviteToken: string;
  expiresAt: string;
  invitedBy: string;
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  invitedByAvatarUrl?: string | null;
  createdAt: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
}

export interface InviteWithRelationsResponseDto extends InviteResponseDto {
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
  profile?: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
  };
}
