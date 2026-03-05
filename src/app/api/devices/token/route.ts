import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignJWT } from "jose";

export async function POST(_req: NextRequest) {
  try {
    // Authenticate user session
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
          message: "Usuário não autenticado ou sem restaurante ativo.",
        },
        { status: 401 },
      );
    }

    const tenantId = activeOrganizationId;
    const clientSecret =
      process.env.PRINT_HUB_JWT_SECRET || "Segredo_Compartilhado_Hub"; // The same secret the Hub AuthController expects. We MUST securely inject this.

    // Next.js directly mints the JWT locally, bypassing the circular dependency on the uninstalled Hub!
    const secretKey = new TextEncoder().encode(clientSecret);
    const token = await new SignJWT({
      tenantId: tenantId,
      clientId: `web_agent_${tenantId}`,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("10y") // Long-lived token for a physical device integration
      .setSubject(`web_agent_${tenantId}`)
      .sign(secretKey);

    return NextResponse.json({ token, success: true });
  } catch (error) {
    console.error("POST /api/devices/token erro:", error);
    return NextResponse.json(
      {
        message: "Erro ao pedir a geração do Token JWT.",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
