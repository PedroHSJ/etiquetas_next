import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { StorageLocationBackendService } from "@/lib/services/server/storageLocationService";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "@/types/common/api";
import {
  CreateStorageLocationDto,
  ListStorageLocationsDto,
  StorageLocationResponseDto,
} from "@/types/dto/storage-location";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId") || undefined;
    const search = searchParams.get("search") || undefined;
    const parentId = searchParams.has("parentId") ? searchParams.get("parentId") : undefined;

    const service = new StorageLocationBackendService(supabase);
    const params: ListStorageLocationsDto = {
      organizationId,
      search,
      parentId: parentId === "null" ? null : parentId,
    };
    const locations = await service.listStorageLocations(params);

    const successResponse: ApiSuccessResponse<StorageLocationResponseDto[]> = {
      data: locations,
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
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body = await request.json();
    const dto: CreateStorageLocationDto = body;

    const service = new StorageLocationBackendService(supabase);
    const location = await service.createStorageLocation(dto);

    const successResponse: ApiSuccessResponse<StorageLocationResponseDto> = {
      data: location,
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
