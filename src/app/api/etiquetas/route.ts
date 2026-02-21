import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LabelBackendService } from "@/lib/services/server/labelService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { prisma } from "@/lib/prisma";

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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const organizationId = searchParams.get("organizationId");
    const searchTerm = searchParams.get("searchTerm") || undefined;
    const userId = searchParams.get("userId") || undefined;

    const labelService = new LabelBackendService();
    const result = await labelService.listLabels({
      page,
      pageSize,
      organizationId: organizationId || undefined,
      searchTerm,
      userId,
    });

    const successResponse: ApiSuccessResponse<typeof result> = {
      data: result,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro na API de etiquetas:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching labels",
      details: err instanceof Error ? { message: err.message } : undefined,
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
    const {
      productId,
      quantity,
      observacoes,
      organizationId,
      tipo,
      data_abertura,
      data_validade,
      responsavel,
      horario,
      data_coleta,
      data_descarte,
      obs,
    } = body;

    // TODO: Validar campos obrigatórios
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    // Organizar dados extras em um objeto JSON stringificado para o campo 'notes'
    const extraData: any = {
      tipo,
      observacoes,
      responsavel,
    };

    if (tipo === "produto_aberto") {
      extraData.data_abertura = data_abertura;
      extraData.data_validade = data_validade;
    } else if (tipo === "amostra") {
      extraData.horario = horario;
      extraData.data_coleta = data_coleta;
      extraData.data_descarte = data_descarte;
      extraData.obs = obs;
    }

    // Buscar organizacao do usuario se nao fornecida
    let orgId = organizationId;
    if (!orgId) {
      // Tentar buscar organização padrão do usuário
      const userOrg = await prisma.user_organizations.findFirst({
        where: { userId: session.user.id, active: true },
        select: { organizationId: true },
      });
      orgId = userOrg?.organizationId;
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 400 },
      );
    }

    const labelService = new LabelBackendService();
    const result = await labelService.createLabel({
      productId: Number(productId),
      userId: session.user.id,
      organizationId: orgId,
      quantity: Number(quantity),
      notes: JSON.stringify(extraData),
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar etiqueta:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
