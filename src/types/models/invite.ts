/**
 * Invite Model - Frontend representation with Date objects
 */
export interface Invite {
  id: string;
  email: string;
  organizationId: string;
  profileId: string;
  status: string;
  inviteToken: string;
  expiresAt: Date;
  invitedBy: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  acceptedAt: Date | null;
  acceptedBy: string | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
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
