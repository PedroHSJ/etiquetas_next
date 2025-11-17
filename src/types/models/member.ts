import { Profile } from "./profile";

/**
 * Representa um integrante/membro vinculado a uma organização
 */
export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  profileId: string;
  active: boolean;
  entryDate: Date | null;
  exitDate: Date | null;
  createdAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  profile?: Profile;
}
