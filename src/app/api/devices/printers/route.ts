import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(_req: NextRequest) {
  try {
    // Authenticate user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const requestHeaders = await headers();
    const activeOrganizationId = requestHeaders.get("x-organization-id");

    if (!session || !session.user || !activeOrganizationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário não autenticado ou sem restaurante ativo.",
        },
        { status: 401 },
      );
    }

    const tenantId = activeOrganizationId;

    // Use PRINT_SERVICE_URL but strip the /api/print and hit the base
    const printServiceBaseUrl = process.env.PRINT_SERVICE_URL
      ? process.env.PRINT_SERVICE_URL.replace(/\/api\/print\/?$/, "")
      : "http://localhost:5000";

    const fetchUrl = `${printServiceBaseUrl}/api/Print/impressoras/${tenantId}`;

    // Call the PrinterHub.Server
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `PrinterHub failed to return printers: ${response.statusText}`,
      );
      return NextResponse.json(
        {
          message:
            "Falha ao obter impressoras conectadas do servidor de impressão.",
        },
        { status: response.status },
      );
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/devices/printers erro:", error);
    return NextResponse.json(
      {
        message: "Erro ao processar requisição interna.",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
