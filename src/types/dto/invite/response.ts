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
  expiresAt: Date;
  invitedBy: string;
  createdAt: Date;
  acceptedAt: Date | null;
  acceptedBy: string | null;
  rejectedAt: Date | null;
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
  };
}
