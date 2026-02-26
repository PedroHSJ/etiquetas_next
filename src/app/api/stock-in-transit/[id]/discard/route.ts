import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StockInTransitBackendService } from "@/lib/services/server/stockInTransitService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "organizationId is required" },
        { status: 400 },
      );
    }

    const service = new StockInTransitBackendService();
    await service.discard(id, session.user.id, organizationId);

    return NextResponse.json({
      success: true,
      message: "Removido do estoque em trânsito com sucesso",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
