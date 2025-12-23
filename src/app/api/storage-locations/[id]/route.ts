import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { StorageLocationBackendService } from "@/lib/services/server/storageLocationService";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "@/types/common/api";
import {
  UpdateStorageLocationDto,
  StorageLocationResponseDto,
} from "@/types/dto/storage-location";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Access token not provided" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const service = new StorageLocationBackendService(supabase);
    const location = await service.getStorageLocationById(id);

    if (!location) {
      return NextResponse.json({ error: "Storage location not found" }, { status: 404 });
    }

    const successResponse: ApiSuccessResponse<StorageLocationResponseDto> = {
      data: location,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error(`Error on /api/storage-locations/${id} GET route:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Access token not provided" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const dto: UpdateStorageLocationDto = body;

    const service = new StorageLocationBackendService(supabase);
    const location = await service.updateStorageLocation(id, dto);

    const successResponse: ApiSuccessResponse<StorageLocationResponseDto> = {
      data: location,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error(`Error on /api/storage-locations/${id} PUT route:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Access token not provided" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const service = new StorageLocationBackendService(supabase);
    await service.deleteStorageLocation(id);

    return NextResponse.json({ data: true }, { status: 200 });
  } catch (err) {
    console.error(`Error on /api/storage-locations/${id} DELETE route:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
