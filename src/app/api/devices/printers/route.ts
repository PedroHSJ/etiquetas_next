import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const DEFAULT_PRINT_SERVICE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/print"
    : "https://printhubservice.duckdns.org/api/print";

function getPrintServiceUrl() {
  return (process.env.PRINT_SERVICE_URL || DEFAULT_PRINT_SERVICE_URL).replace(
    /\/$/,
    "",
  );
}

type HubPrinterInfo = {
  name?: string;
  portName?: string;
  isNetworkPrinter?: boolean;
};

export async function GET(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const requestHeaders = await headers();
    const activeOrganizationId = requestHeaders.get("x-organization-id");

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
    const fetchUrl = `${getPrintServiceUrl()}/impressoras/${encodeURIComponent(tenantId)}`;

    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `PrinterHub failed to return printers: ${response.statusText}`,
      );
      return NextResponse.json(
        {
          message: "Falha ao obter impressoras conectadas do servidor de impressao.",
        },
        { status: response.status },
      );
    }

    const result = (await response.json()) as HubPrinterInfo[];

    const printers = Array.isArray(result)
      ? result
          .map((printer) => ({
            printerName: printer.name || "",
            portName: printer.portName,
            isNetworkPrinter: printer.isNetworkPrinter ?? false,
          }))
          .filter((printer) => printer.printerName)
      : [];

    return NextResponse.json(printers);
  } catch (error) {
    console.error("GET /api/devices/printers erro:", error);
    return NextResponse.json(
      {
        message: "Erro ao processar requisicao interna.",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
