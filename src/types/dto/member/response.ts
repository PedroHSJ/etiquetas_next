import { ProfileResponseDto } from "@/types/dto/profile/response";

export interface MemberResponseDto {
  id: string;
  userId: string;
  organizationId: string;
  profileId: string;
  active: boolean;
  entryDate: string | null;
  exitDate: string | null;
  createdAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  profile?: ProfileResponseDto;
}
