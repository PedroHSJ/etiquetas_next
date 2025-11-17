import { UserOrganizationEntity, ProfileEntity } from "@/types/database/profile";
import { MemberResponseDto } from "@/types/dto/member/response";
import { Profile } from "@/types/models/profile";
import { Member } from "@/types/models/member";

type MemberEntityWithProfile = UserOrganizationEntity & {
  profile?: ProfileEntity;
};

interface BasicUserInfo {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  picture?: string | null;
}

/**
 * Converte entidade de user_organizations (com perfil expandido) + dados básicos do usuário
 * para o DTO usado pela camada de API
 */
export function toMemberResponseDto(
  entity: MemberEntityWithProfile,
  user?: BasicUserInfo | null
): MemberResponseDto {
  return {
    id: entity.id,
    userId: entity.user_id,
    organizationId: entity.organization_id,
    profileId: entity.profile_id,
    active: entity.active,
    entryDate: entity.entry_date ?? entity.created_at ?? null,
    exitDate: entity.exit_date,
    createdAt: entity.created_at ?? null,
    user: {
      id: user?.id ?? entity.user_id,
      name: user?.name ?? "Usuário",
      email: user?.email ?? "",
      avatarUrl:
        user?.avatarUrl ?? user?.avatar_url ?? user?.picture ?? null,
    },
    profile: entity.profile
      ? {
          id: entity.profile.id,
          name: entity.profile.name,
          description: entity.profile.description,
          active: entity.profile.active,
          createdAt: entity.profile.created_at,
        }
      : undefined,
  };
}

/**
 * Converte DTO → model frontend (usa Date e normaliza relacionamentos)
 */
export function toMemberModel(dto: MemberResponseDto): Member {
  return {
    id: dto.id,
    userId: dto.userId,
    organizationId: dto.organizationId,
    profileId: dto.profileId,
    active: dto.active,
    entryDate: dto.entryDate ? new Date(dto.entryDate) : null,
    exitDate: dto.exitDate ? new Date(dto.exitDate) : null,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
    user: {
      id: dto.user.id,
      name: dto.user.name,
      email: dto.user.email,
      avatarUrl: dto.user.avatarUrl ?? null,
    },
    profile: dto.profile
      ? ({
          id: dto.profile.id,
          name: dto.profile.name,
          description: dto.profile.description,
          active: dto.profile.active,
          createdAt: dto.profile.createdAt,
        } as Profile)
      : undefined,
  };
}

export function toMemberModelList(dtos: MemberResponseDto[]): Member[] {
  return dtos.map(toMemberModel);
}
