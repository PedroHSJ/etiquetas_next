import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProductBackendService } from "@/lib/services/server/productService";
import { ApiErrorResponse } from "@/types/common/api";

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
    const organizationId = searchParams.get("organizationId");

    // Se não passar organizationId, poderia pegar do user session por padrão,
    // ou requerer parametro. O frontend atual não passa provavelmente, então vou pegar do session ou retornar erro.
    // O service getGroups requer organizationId.

    // TODO: Melhorar tipagem da session para incluir organizationId se estiver estendida
    // @ts-ignore
    const targetOrgId = organizationId || session.user.organizationId;

    if (!targetOrgId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 },
      );
    }

    const service = new ProductBackendService();
    const groups = await service.getGroups(targetOrgId);
    // Formatar como o frontend espera?
    // O frontend espera: { data: [{ id, name }], error } se vier do supabase.
    // Com fetch, espera array se sucesso. O componente espera { data, error } no formato supabase response?
    // Não, o componente original usava supabase.from("groups").select("id, name").
    // Isso retornava { data: [], error: null }.
    // Se eu substituo por fetch, tenho que retornar o array ou adequar o frontend.
    // O frontend novo (que vou atualizar) deve processar JSON.

    return NextResponse.json(groups);
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
