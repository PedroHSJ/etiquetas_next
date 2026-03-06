import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const DEFAULT_PRINT_SERVICE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/print"
    : "https://printhubservice.duckdns.org/api/print";

function getHubBaseUrl() {
  const printServiceUrl = process.env.PRINT_SERVICE_URL || DEFAULT_PRINT_SERVICE_URL;
  return printServiceUrl.replace(/\/api\/print\/?$/, "").replace(/\/$/, "");
}

export async function POST(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const requestHeaders = await headers();
    const activeOrganizationId = requestHeaders.get("x-organization-id");

    console.log("Token Generation Request Debug:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      activeOrganizationId,
      method: _req.method,
      origin: requestHeaders.get("origin"),
    });

    if (!session || !session.user || !activeOrganizationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario nao autenticado ou sem restaurante ativo.",
        },
        { status: 401 },
      );
    }

    const tenantId = activeOrganizationId;
    const clientSecret =
      process.env.PRINT_HUB_CLIENT_SECRET || process.env.PRINT_HUB_JWT_SECRET;

    if (!clientSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "PRINT_HUB_CLIENT_SECRET nao configurado no ambiente.",
        },
        { status: 500 },
      );
    }

    const hubResponse = await fetch(`${getHubBaseUrl()}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: `web_agent_${tenantId}`,
        tenantId,
        secret: clientSecret,
      }),
      cache: "no-store",
    });

    if (!hubResponse.ok) {
      const errorText = await hubResponse.text();
      console.error("Hub token generation failed:", {
        status: hubResponse.status,
        errorText,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Falha ao gerar token no Hub de impressao.",
          error: errorText,
        },
        { status: hubResponse.status },
      );
    }

    const { token } = (await hubResponse.json()) as { token?: string };

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Hub respondeu sem token.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ token, success: true });
  } catch (error) {
    console.error("POST /api/devices/token erro:", error);
    return NextResponse.json(
      {
        message: "Erro ao pedir a geracao do Token JWT.",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
