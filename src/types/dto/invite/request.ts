/**
 * Request DTOs for Invite operations
 */

export interface CreateInviteDto {
  email: string;
  organizationId: string;
  profileId: string;
  invitedBy: string;
}

export interface AcceptInviteDto {
  inviteToken: string;
  userId: string;
}

export interface ListInvitesDto {
  email?: string;
  status?: string;
  organizationId?: string;
}
