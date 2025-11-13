// Database entity types for invites
export interface InviteEntity {
  id: string;
  email: string;
  organization_id: string;
  profile_id: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "canceled";
  invite_token: string;
  expires_at: string;
  invited_by: string;
  created_at: string;
  accepted_at?: string;
  accepted_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  canceled_at?: string;
  organization?: {
    name: string;
    type: string;
  };
  profile?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface InviteInviteWithRelationsEntity extends InviteEntity {
  organization?: {
    name: string;
    type: string;
  };
  profile?: {
    id: string;
    name: string;
    description?: string;
  };
}
