"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationService } from "@/lib/services/client/organization-service";
import { organizationQueryKeys } from "@/lib/queryKeys/organization";
import { USER_PROFILES_QUERY_KEY } from "@/hooks/useUserProfilesQuery";
import {
  OrganizationExpandedResponseDto,
  OrganizationResponseDto,
} from "@/types/dto/organization/response";
import { UpdateOrganizationDto } from "@/types/dto/organization/request";
import {
  Organization,
  TechnicalResponsible,
} from "@/types/models/organization";
import { City, State } from "@/types/models/location";
import { OrganizationType, ResponsibleType } from "@/types/enums/organization";

const RESPONSIBLE_TYPE_VALUES = new Set<string>(Object.values(ResponsibleType));

const getFallbackDate = () => new Date(0);

const parseOrganizationType = (value: string | null): OrganizationType | null => {
  if (!value) {
    return null;
  }

  return value as OrganizationType;
};

const parseResponsibleType = (value: string): ResponsibleType => {
  return RESPONSIBLE_TYPE_VALUES.has(value)
    ? (value as ResponsibleType)
    : ResponsibleType.OTHER;
};

const mapStateDtoToModel = (
  state?: OrganizationExpandedResponseDto["state"],
): State | undefined => {
  if (!state) {
    return undefined;
  }

  return {
    id: state.id,
    code: state.code,
    name: state.name,
    region: state.region,
    createdAt: getFallbackDate(),
  };
};

const mapCityDtoToModel = (
  city?: OrganizationExpandedResponseDto["city"],
): City | undefined => {
  if (!city) {
    return undefined;
  }

  return {
    id: city.id,
    stateId: city.state?.id ?? 0,
    ibgeCode: city.ibgeCode,
    name: city.name,
    zipCodeStart: null,
    zipCodeEnd: null,
    latitude: null,
    longitude: null,
    createdAt: getFallbackDate(),
    updatedAt: getFallbackDate(),
  };
};

const mapTechnicalResponsibleDtoToModel = (
  organizationId: string,
  technicalResponsible?: OrganizationExpandedResponseDto["technicalResponsible"],
): TechnicalResponsible | null => {
  if (!technicalResponsible) {
    return null;
  }

  return {
    id: technicalResponsible.id,
    organizationId,
    responsibleType: parseResponsibleType(technicalResponsible.responsibleType),
    name: technicalResponsible.name,
    document: technicalResponsible.document,
    phone: technicalResponsible.phone,
    email: technicalResponsible.email,
    notes: null,
    active: true,
    createdAt: getFallbackDate(),
    updatedAt: getFallbackDate(),
  };
};

export const mapOrganizationResponseDtoToModel = (
  organization: OrganizationResponseDto,
): Organization => {
  return {
    id: organization.id,
    name: organization.name,
    type: parseOrganizationType(organization.type),
    createdBy: organization.createdBy,
    createdAt: new Date(organization.createdAt),
    updatedAt: new Date(organization.updatedAt),
    cnpj: organization.cnpj,
    capacity: organization.capacity,
    openingDate: organization.openingDate
      ? new Date(organization.openingDate)
      : null,
    fullAddress: organization.fullAddress,
    zipCode: organization.zipCode,
    district: organization.district,
    latitude: organization.latitude,
    longitude: organization.longitude,
    mainPhone: organization.mainPhone,
    altPhone: organization.altPhone,
    institutionalEmail: organization.institutionalEmail,
    stateId: organization.stateId,
    cityId: organization.cityId,
    address: organization.address,
    number: organization.number,
    addressComplement: organization.addressComplement,
  };
};

export const mapOrganizationExpandedResponseDtoToModel = (
  organization: OrganizationExpandedResponseDto,
): Organization => {
  const baseOrganization = mapOrganizationResponseDtoToModel(organization);

  return {
    ...baseOrganization,
    state: mapStateDtoToModel(organization.state),
    city: mapCityDtoToModel(organization.city),
    technicalResponsible: mapTechnicalResponsibleDtoToModel(
      organization.id,
      organization.technicalResponsible,
    ),
  };
};

const mergeUpdatedOrganizationInList = (
  currentOrganizations: Organization[] | undefined,
  updatedOrganization: Organization,
): Organization[] | undefined => {
  if (!currentOrganizations) {
    return currentOrganizations;
  }

  return currentOrganizations.map((organization) =>
    organization.id === updatedOrganization.id
      ? {
          ...organization,
          ...updatedOrganization,
        }
      : organization,
  );
};

export function useOrganizationsQuery() {
  const { userId } = useAuth();

  return useQuery<Organization[], Error>({
    queryKey: organizationQueryKeys.currentUserList(userId),
    queryFn: async () => {
      const organizations = await OrganizationService.getOrganizations();
      return organizations.map(mapOrganizationResponseDtoToModel);
    },
    enabled: Boolean(userId),
  });
}

export function useOrganizationsExpandedByUserQuery(userId?: string) {
  return useQuery<Organization[], Error>({
    queryKey: organizationQueryKeys.expandedUserList(userId ?? ""),
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const organizations =
        await OrganizationService.getOrganizationsByUserIdExpanded(userId);

      return organizations.map(mapOrganizationExpandedResponseDtoToModel);
    },
    enabled: Boolean(userId),
  });
}

export function useOrganizationExpandedQuery(organizationId?: string | null) {
  return useQuery<Organization, Error>({
    queryKey: organizationQueryKeys.detailExpanded(organizationId ?? ""),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("organizationId é obrigatório");
      }

      const organization =
        await OrganizationService.getOrganizationByIdExpanded(organizationId);

      return mapOrganizationExpandedResponseDtoToModel(organization);
    },
    enabled: Boolean(organizationId),
  });
}

export function useInvalidateOrganizations() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: organizationQueryKeys.all,
    });
}

interface UpdateOrganizationExpandedVariables {
  organizationId: string;
  update: UpdateOrganizationDto;
}

export function useUpdateOrganizationExpandedMutation() {
  const queryClient = useQueryClient();

  return useMutation<Organization, Error, UpdateOrganizationExpandedVariables>({
    mutationFn: async ({ organizationId, update }) => {
      const updatedOrganization =
        await OrganizationService.updateOrganizationExpanded(
          organizationId,
          update,
        );

      return mapOrganizationExpandedResponseDtoToModel(updatedOrganization);
    },
    onSuccess: async (updatedOrganization) => {
      queryClient.setQueryData(
        organizationQueryKeys.detailExpanded(updatedOrganization.id),
        updatedOrganization,
      );
      queryClient.setQueriesData<Organization[]>(
        {
          queryKey: organizationQueryKeys.lists(),
        },
        (currentOrganizations) =>
          mergeUpdatedOrganizationInList(
            currentOrganizations,
            updatedOrganization,
          ),
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: USER_PROFILES_QUERY_KEY,
        }),
      ]);
    },
  });
}
