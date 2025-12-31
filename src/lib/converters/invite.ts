import { InviteEntity } from "@/types/database/invite";
import {
  InviteResponseDto,
  InviteWithRelationsResponseDto,
} from "@/types/dto/invite";
import { Invite } from "@/types/models/invite";
import { OrganizationResponseDto } from "@/types/dto/organization/response";
import { ProfileResponseDto } from "@/types/dto/profile/response";

/**
 * Converte InviteEntity (banco) para InviteWithRelationsResponseDto (API)
 */
export function toInviteWithRelationsResponseDto(
  entity: InviteEntity
): InviteWithRelationsResponseDto {
  const base: InviteResponseDto = {
    id: entity.id,
    email: entity.email,
    organizationId: entity.organization_id,
    profileId: entity.profile_id,
    status: entity.status,
    inviteToken: entity.invite_token,
    expiresAt: entity.expires_at,
    invitedBy: entity.invited_by,
    invitedByName: entity.invited_by_name ?? null,
    invitedByEmail: entity.invited_by_email ?? null,
    invitedByAvatarUrl: entity.invited_by_avatar_url ?? null,
    createdAt: entity.created_at,
    acceptedAt: entity.accepted_at ?? null,
    acceptedBy: entity.accepted_by ?? null,
    rejectedAt: entity.rejected_at ?? null,
    rejectedBy: entity.rejected_by ?? null,
  };

  const organization: OrganizationResponseDto | undefined = entity.organization
    ? {
        id: entity.organization.id,
        name: entity.organization.name,
        type: entity.organization.type,
        createdBy: null,
        createdAt: "",
        updatedAt: "",
        cnpj: null,
        capacity: null,
        openingDate: null,
        fullAddress: null,
        zipCode: null,
        district: null,
        latitude: null,
        longitude: null,
        mainPhone: null,
        altPhone: null,
        institutionalEmail: null,
        stateId: null,
        cityId: null,
        address: null,
        number: null,
        addressComplement: null,
      }
    : undefined;

  const profile: ProfileResponseDto | undefined = entity.profile
    ? {
        id: entity.profile.id,
        name: entity.profile.name,
        description: entity.profile.description ?? null,
        active: true,
        createdAt: "",
      }
    : undefined;

  return {
    ...base,
    organization,
    profile,
  };
}

/**
 * Converte InviteWithRelationsResponseDto para Invite (modelo frontend)
 */
export function toInviteModel(dto: InviteWithRelationsResponseDto): Invite {
  return {
    id: dto.id,
    email: dto.email,
    organizationId: dto.organizationId,
    profileId: dto.profileId,
    status: dto.status,
    inviteToken: dto.inviteToken,
    expiresAt: new Date(dto.expiresAt),
    invitedBy: {
      id: dto.invitedBy,
      name: dto.invitedByName ?? dto.invitedByEmail ?? dto.email, // fallback razoável
      email: dto.invitedByEmail ?? undefined,
      avatarUrl: dto.invitedByAvatarUrl ?? undefined,
    },
    createdAt: new Date(dto.createdAt),
    acceptedAt: dto.acceptedAt ? new Date(dto.acceptedAt) : null,
    acceptedBy: dto.acceptedBy,
    rejectedAt: dto.rejectedAt ? new Date(dto.rejectedAt) : null,
    rejectedBy: dto.rejectedBy,
    organization: dto.organization
      ? {
          id: dto.organization.id,
          name: dto.organization.name,
          type: dto.organization.type,
        }
      : undefined,
    profile: dto.profile
      ? {
          id: dto.profile.id,
          name: dto.profile.name,
          description: dto.profile.description,
        }
      : undefined,
  };
}

export function toInviteModelList(
  dtos: InviteWithRelationsResponseDto[]
): Invite[] {
  return dtos.map(toInviteModel);
}
