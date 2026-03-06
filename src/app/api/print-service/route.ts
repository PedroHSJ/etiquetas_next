import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const DEFAULT_PRINT_SERVICE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/print"
    : "https://printhubservice.duckdns.org/api/print";

const LegacyPrintJobSchema = z.object({
  printerName: z.string(),
  language: z.string(),
  size: z.string(),
  gap: z.string(),
  productName: z.string(),
  code: z.string(),
  lot: z.string(),
  weight: z.string(),
  validity: z.string(),
  storage: z.string(),
  responsible: z.string(),
  barcode: z.string(),
  organizationId: z.string().min(1, "organizationId is required"),
});

const RawPrintJobSchema = z.object({
  printerName: z.string().min(1, "printerName is required"),
  organizationId: z.string().min(1, "organizationId is required"),
  printData: z.string().min(1, "printData is required"),
});

type LegacyPrintJobVariables = z.infer<typeof LegacyPrintJobSchema>;

function buildTSPL(data: LegacyPrintJobVariables): string {
  return (
    `SIZE ${data.size}\r\n` +
    `GAP ${data.gap}\r\n` +
    `DIRECTION 0\r\nCLS\r\n\r\n` +
    `TEXT 20,125,"3",0,2,1,"${data.productName}"\r\n` +
    `TEXT 20,165,"1",0,1,1,"Codigo: ${data.code}"\r\n` +
    `TEXT 20,185,"1",0,1,1,"Lote: ${data.lot}"\r\n` +
    `TEXT 20,205,"1",0,1,1,"Peso: ${data.weight}"\r\n` +
    `TEXT 20,263,"3",0,2,1,"${data.validity}"\r\n` +
    `TEXT 20,315,"1",0,1,1,"Arm: ${data.storage}"\r\n` +
    `TEXT 20,335,"1",0,1,1,"Resp: ${data.responsible}"\r\n` +
    `BARCODE 280,330,"128",50,1,0,1,2,"${data.barcode}"\r\n` +
    `PRINT 1\r\n`
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Usuario nao autenticado." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const rawResult = RawPrintJobSchema.safeParse(body);

    let payload: {
      tenantId: string;
      printerName: string;
      printData: string;
    };

    if (rawResult.success) {
      payload = {
        tenantId: rawResult.data.organizationId,
        printerName: rawResult.data.printerName,
        printData: rawResult.data.printData,
      };
    } else {
      const legacyResult = LegacyPrintJobSchema.safeParse(body);

      if (!legacyResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Dados invalidos",
            errors: legacyResult.error.issues,
          },
          { status: 400 },
        );
      }

      payload = {
        tenantId: legacyResult.data.organizationId,
        printerName: legacyResult.data.printerName,
        printData: buildTSPL(legacyResult.data),
      };
    }

    const printServiceUrl =
      process.env.PRINT_SERVICE_URL || DEFAULT_PRINT_SERVICE_URL;

    const response = await fetch(printServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.PRINT_HUB_API_KEY || "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseText = await response.text();
    let responseBody: unknown = null;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = { raw: responseText };
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao encaminhar impressao para o hub.",
          result: responseBody,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        result: responseBody,
      },
      { status: response.status },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao processar requisicao.", error: String(error) },
      { status: 500 },
    );
  }
}
