import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StorageLocationBackendService } from "@/lib/services/server/storageLocationService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import {
  CreateStorageLocationDto,
  ListStorageLocationsDto,
  StorageLocationResponseDto,
} from "@/types/dto/storage-location";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const errorResponse: ApiErrorResponse = {
      error: "Unauthorized",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId") || undefined;
    const search = searchParams.get("search") || undefined;
    const parentId = searchParams.has("parentId")
      ? searchParams.get("parentId")
      : undefined;

    const service = new StorageLocationBackendService();
    const params: ListStorageLocationsDto = {
      organizationId,
      search,
      parentId: parentId === "null" ? null : parentId,
    };
    const locations = await service.listStorageLocations(params);

    const successResponse: ApiSuccessResponse<StorageLocationResponseDto[]> = {
      data: locations as unknown as StorageLocationResponseDto[],
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/storage-locations route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching storage locations",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const errorResponse: ApiErrorResponse = {
      error: "Unauthorized",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const body = await request.json();
    const dto: CreateStorageLocationDto = body;

    const service = new StorageLocationBackendService();
    const location = await service.createStorageLocation(dto);

    const successResponse: ApiSuccessResponse<StorageLocationResponseDto> = {
      data: location as unknown as StorageLocationResponseDto,
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (err) {
    console.error("Error on /api/storage-locations POST route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while creating storage location",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
