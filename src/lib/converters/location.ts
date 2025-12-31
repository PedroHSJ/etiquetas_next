import { CityEntity, StateEntity } from "@/types/database/location";
import {
  CityResponseDto,
  StateResponseDto,
  CityCreationResponseDto,
} from "@/types/dto/location/response";
import { City, CityWithState, State } from "@/types/models/location";

export function toStateResponseDto(entity: StateEntity): StateResponseDto {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    region: entity.region,
    createdAt: entity.created_at,
  };
}

export function toCityResponseDto(
  entity: CityEntity & { state?: StateEntity }
): CityResponseDto {
  return {
    id: entity.id,
    stateId: entity.state_id,
    ibgeCode: entity.ibge_code,
    name: entity.name,
    zipCodeStart: entity.zip_code_start,
    zipCodeEnd: entity.zip_code_end,
    latitude: entity.latitude,
    longitude: entity.longitude,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
    state: entity.state ? toStateResponseDto(entity.state) : undefined,
  };
}

export function toStateModel(dto: StateResponseDto): State {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    region: dto.region,
    createdAt: new Date(dto.createdAt),
  };
}

export function toCityModel(dto: CityResponseDto): City {
  return {
    id: dto.id,
    stateId: dto.stateId,
    ibgeCode: dto.ibgeCode,
    name: dto.name,
    zipCodeStart: dto.zipCodeStart,
    zipCodeEnd: dto.zipCodeEnd,
    latitude: dto.latitude,
    longitude: dto.longitude,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function toCityWithStateModel(dto: CityResponseDto): CityWithState {
  return {
    ...toCityModel(dto),
    state: dto.state ? toStateModel(dto.state) : undefined,
  };
}

export function toCityFromCreationDto(
  dto: CityCreationResponseDto
): CityWithState {
  const now = new Date();
  return {
    id: dto.id,
    stateId: dto.estado.id,
    ibgeCode: null,
    name: dto.nome,
    zipCodeStart: null,
    zipCodeEnd: null,
    latitude: null,
    longitude: null,
    createdAt: now,
    updatedAt: now,
    state: {
      id: dto.estado.id,
      code: dto.estado.codigo,
      name: dto.estado.nome,
      region: "",
      createdAt: now,
    },
  };
}
