import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const DEFAULT_PRINT_SERVICE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/print"
    : "https://printhubservice.duckdns.org/api/print";

function getPrintServiceActionUrl(): string {
  const configuredUrl =
    process.env.PRINT_SERVICE_URL || DEFAULT_PRINT_SERVICE_URL;
  const normalizedUrl = configuredUrl.replace(/\/$/, "");

  if (
    normalizedUrl.endsWith("/api/print/print") ||
    normalizedUrl.endsWith("/api/print/imprimir")
  ) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/print`;
}

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

const SamplePayloadSchema = z.object({
  sampleName: z.string().min(1, "sampleName is required"),
  collectionTime: z.string().min(1, "collectionTime is required"),
  collectionDate: z.string().min(1, "collectionDate is required"),
  discardDate: z.string().min(1, "discardDate is required"),
  responsibleName: z.string().min(1, "responsibleName is required"),
});

const ProductPayloadSchema = z.object({
  productName: z.string().min(1, "productName is required"),
  manufacturingDate: z.string().min(1, "manufacturingDate is required"),
  validityDate: z.string().min(1, "validityDate is required"),
  openingDate: z.string().optional().nullable(),
  validityAfterOpening: z.string().optional().nullable(),
  conservationMode: z.enum(["REFRIGERADO", "CONGELADO", "AMBIENTE"]),
  responsibleName: z.string().min(1, "responsibleName is required"),
  organizationName: z.string().optional().nullable(),
  organizationCnpj: z.string().optional().nullable(),
  organizationZipCode: z.string().optional().nullable(),
  organizationAddress: z.string().optional().nullable(),
  organizationNumber: z.string().optional().nullable(),
  organizationAddressComplement: z.string().optional().nullable(),
  organizationCity: z.string().optional().nullable(),
  organizationState: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unit: z.string().min(1, "unit is required"),
});

const StockInTransitPayloadSchema = z.object({
  productName: z.string().min(1, "productName is required"),
  quantity: z.number().positive(),
  unit: z.string().min(1, "unit is required"),
  manufacturingDate: z.string().min(1, "manufacturingDate is required"),
  validityDate: z.string().min(1, "validityDate is required"),
  observations: z.string().optional().nullable(),
  userName: z.string().optional().nullable(),
});

const StructuredPrintJobSchema = z.discriminatedUnion("template", [
  z.object({
    printerName: z.string().min(1, "printerName is required"),
    organizationId: z.string().min(1, "organizationId is required"),
    template: z.literal("sample"),
    copies: z.number().int().min(1).optional(),
    payload: SamplePayloadSchema,
  }),
  z.object({
    printerName: z.string().min(1, "printerName is required"),
    organizationId: z.string().min(1, "organizationId is required"),
    template: z.literal("product"),
    copies: z.number().int().min(1).optional(),
    payload: ProductPayloadSchema,
  }),
  z.object({
    printerName: z.string().min(1, "printerName is required"),
    organizationId: z.string().min(1, "organizationId is required"),
    template: z.literal("stock_in_transit"),
    copies: z.number().int().min(1).optional(),
    payload: StockInTransitPayloadSchema,
  }),
]);

type LegacyPrintJobVariables = z.infer<typeof LegacyPrintJobSchema>;

type StructuredPrintJob = z.infer<typeof StructuredPrintJobSchema>;

type PrintTemplate = StructuredPrintJob["template"];

type SamplePayload = z.infer<typeof SamplePayloadSchema>;

type ProductPayload = z.infer<typeof ProductPayloadSchema>;

type StockInTransitPayload = z.infer<typeof StockInTransitPayloadSchema>;

function normalizeCopies(copies?: number): number {
  if (!Number.isFinite(copies)) return 1;
  return Math.max(1, Math.floor(copies as number));
}

function sanitizeText(value?: string | null, maxLength = 32): string {
  if (!value) return "-";
  return value.replace(/["\r\n]+/g, " ").trim().slice(0, maxLength) || "-";
}

function normalizeLabelText(value?: string | null, maxLength = 32): string {
  if (!value) return "";
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return sanitizeText(cleaned, maxLength).toUpperCase();
}

function splitLabelLines(value: string, maxLen: number, maxLines = 2): string[] {
  if (!value) return [];
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, maxLen));
      current = word.slice(maxLen);
    }

    if (lines.length >= maxLines) {
      current = "";
      break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines.slice(0, maxLines).map((line) => line.slice(0, maxLen));
}


function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";

  try {
    if (dateStr.includes("-") && dateStr.length === 10) {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return formatDateValue(date);
    }

    const parsed = new Date(dateStr);
    return formatDateValue(parsed);
  } catch {
    return dateStr;
  }
}

function formatDateValue(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCnpjValue(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length != 14) return value;
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`;
}

function formatCepValue(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length != 8) return value;
  return `${digits.slice(0,5)}-${digits.slice(5)}`;
}

function buildTsplLabel(lines: string[], copies = 1): string {
  const normalizedCopies = normalizeCopies(copies);

  return [
    "SIZE 60 mm, 60 mm",
    "GAP 3 mm, 0 mm",
    "DIRECTION 0",
    "CLS",
    "",
    ...lines,
    "",
    `PRINT 1,${normalizedCopies}`,
    "",
  ].join("\r\n");
}

function buildSampleTspl(payload: SamplePayload, copies = 1): string {
  return buildTsplLabel(
    [
      "TEXT 20,20,\"2\",0,1,1,\"AMOSTRA\"",
      "BOX 15,45,435,48,2",
      `TEXT 20,65,\"3\",0,2,1,\"${sanitizeText(payload.sampleName, 24)}\"`,
      `TEXT 20,115,\"1\",0,1,1,\"Hora: ${sanitizeText(payload.collectionTime, 8)}\"`,
      `TEXT 20,140,\"1\",0,1,1,\"Coleta: ${formatDate(payload.collectionDate)}\"`,
      `TEXT 20,165,\"1\",0,1,1,\"Descarte: ${formatDate(payload.discardDate)}\"`,
      `TEXT 20,190,\"1\",0,1,1,\"Resp: ${sanitizeText(payload.responsibleName, 24)}\"`,
    ],
    copies,
  );
}

function buildProductTspl(payload: ProductPayload, copies = 1): string {
  const productName = sanitizeText(payload.productName, 28).toUpperCase();
  const storage = sanitizeText(payload.conservationMode, 18).toUpperCase();
  const manufacturing = formatDate(payload.manufacturingDate);
  const validityOriginal = formatDate(payload.validityDate);
  const handlingDate = formatDate(payload.openingDate);
  const validityAfterOpening = formatDate(payload.validityAfterOpening);
  const responsible = normalizeLabelText(payload.responsibleName ?? "", 24);
  const organizationName = normalizeLabelText(payload.organizationName ?? "", 28);
  const weight = normalizeLabelText(
    `${payload.quantity} ${sanitizeText(payload.unit, 10)}`,
    18,
  );
  const cnpj = normalizeLabelText(formatCnpjValue(payload.organizationCnpj ?? ""), 28);
  const address = normalizeLabelText(payload.organizationAddress ?? "", 28);
  const number = normalizeLabelText(payload.organizationNumber ?? "", 10);
  const complement = normalizeLabelText(payload.organizationAddressComplement ?? "", 18);
  const city = normalizeLabelText(payload.organizationCity ?? "", 18);
  const state = normalizeLabelText(payload.organizationState ?? "", 6);
  const zip = normalizeLabelText(formatCepValue(payload.organizationZipCode ?? ""), 12);

  const addressLine =
    [address, number].filter(Boolean).join(", ") +
    (complement ? ` - ${complement}` : "");
  const cityStateLine = [city, state].filter(Boolean).join("/");
  const zipLine = zip ? `CEP: ${zip}` : "";
  const cnpjLine = cnpj ? `CNPJ: ${cnpj}` : "";
  const cityStateAndCep = [cityStateLine, zipLine].filter(Boolean).join(" - ");

  const orgLines = [cnpjLine, addressLine, cityStateAndCep]
    .map((line) => line.trim())
    .filter(Boolean);

  const productLines = splitLabelLines(productName, 18, 2);
  const nameLineY = 18;
  const nameLineSpacing = 28;
  const rowHeight = 22;
  const storageY =
    nameLineY + (productLines.length || 1) * nameLineSpacing + 4;
  const divider1Y = storageY + 20;
  const infoStartY = divider1Y + 10;

  const divider2Y = infoStartY + rowHeight * 4 + 6;
  const section2StartY = divider2Y + 10;

  const divider3Y = section2StartY + rowHeight * 4 + 6;
  const restLabelY = divider3Y + 10;
  const restNameY = restLabelY + rowHeight;
  const orgStartY = restNameY + rowHeight;

  const xOffset = 16;
  const yOffset = 16;

  const boldLeft = (x: number, y: number, label: string): string[] => [
    `TEXT ${x},${y},"2",0,1,1,"${label}"`,
    `TEXT ${x + 1},${y},"2",0,1,1,"${label}"`,
  ];

  const boldText = (x: number, y: number, label: string): string[] => [
    `TEXT ${x},${y},"2",0,1,1,"${label}"`,
    `TEXT ${x + 1},${y},"2",0,1,1,"${label}"`,
  ];

  const orgTextLines = orgLines.flatMap((line, index) => {
    const y = yOffset + orgStartY + index * rowHeight;
    const textLine = sanitizeText(line, 32);
    return boldText(xOffset + 24, y, textLine);
  });

  const productNameLines = productLines.length
    ? productLines
    : [productName.slice(0, 18)];

  const productTextLines = productNameLines.map((line, index) => {
    const y = yOffset + nameLineY + index * nameLineSpacing;
    return `TEXT ${xOffset + 24},${y},"4",0,1,1,"${sanitizeText(line, 18)}"`;
  });

  return buildTsplLabel(
    [
      ...productTextLines,
      `TEXT ${xOffset + 24},${yOffset + storageY},"2",0,1,1,"${storage}"`,
      `BOX ${xOffset + 18},${yOffset + divider1Y},${xOffset + 430},${yOffset + divider1Y + 2},1`,

      ...boldLeft(xOffset + 24, yOffset + infoStartY, "VAL. ORIGINAL:"),
      `TEXT ${xOffset + 300},${yOffset + infoStartY},"2",0,1,1,"${validityOriginal}"`,
      ...boldLeft(xOffset + 24, yOffset + infoStartY + rowHeight, "MANIPULACAO:"),
      `TEXT ${xOffset + 300},${yOffset + infoStartY + rowHeight},"2",0,1,1,"${handlingDate}"`,
      ...boldLeft(xOffset + 24, yOffset + infoStartY + rowHeight * 2, "VALIDADE:"),
      `TEXT ${xOffset + 300},${yOffset + infoStartY + rowHeight * 2},"2",0,1,1,"${validityAfterOpening || validityOriginal}"`,
      ...boldLeft(xOffset + 24, yOffset + infoStartY + rowHeight * 3, "FABRICACAO:"),
      `TEXT ${xOffset + 300},${yOffset + infoStartY + rowHeight * 3},"2",0,1,1,"${manufacturing}"`,

      `BOX ${xOffset + 18},${yOffset + divider2Y},${xOffset + 430},${yOffset + divider2Y + 2},1`,

      ...boldLeft(xOffset + 24, yOffset + section2StartY, "RESP.:"),
      `TEXT ${xOffset + 120},${yOffset + section2StartY},"2",0,1,1,"${responsible}"`,
      ...boldLeft(xOffset + 24, yOffset + section2StartY + rowHeight, "LOTE:"),
      `TEXT ${xOffset + 120},${yOffset + section2StartY + rowHeight},"2",0,1,1,"-"`,
      ...boldLeft(xOffset + 24, yOffset + section2StartY + rowHeight * 2, "PESO:"),
      `TEXT ${xOffset + 120},${yOffset + section2StartY + rowHeight * 2},"2",0,1,1,"${weight}"`,
      ...boldLeft(xOffset + 24, yOffset + section2StartY + rowHeight * 3, "MARCA / FORN:"),
      `TEXT ${xOffset + 200},${yOffset + section2StartY + rowHeight * 3},"2",0,1,1,"-"`,

      `BOX ${xOffset + 18},${yOffset + divider3Y},${xOffset + 430},${yOffset + divider3Y + 2},1`,

      ...boldLeft(xOffset + 24, yOffset + restLabelY, "RESTAURANTE:"),
      `TEXT ${xOffset + 24},${yOffset + restNameY},"2",0,1,1,"${organizationName || "-"}"`,
      ...orgTextLines,
    ],
    copies,
  );
}



function buildStockInTransitTspl(
  payload: StockInTransitPayload,
  copies = 1,
): string {
  return buildTsplLabel(
    [
      "TEXT 20,20,\"2\",0,1,1,\"ESTOQUE EM TRANSITO\"",
      "BOX 15,45,435,48,2",
      `TEXT 20,65,\"3\",0,2,1,\"${sanitizeText(payload.productName, 24)}\"`,
      `TEXT 20,115,\"1\",0,1,1,\"Qtd: ${payload.quantity} ${sanitizeText(payload.unit, 10)}\"`,
      `TEXT 20,140,\"1\",0,1,1,\"Fab: ${formatDate(payload.manufacturingDate)}\"`,
      `TEXT 20,165,\"1\",0,1,1,\"Val: ${formatDate(payload.validityDate)}\"`,
      `TEXT 20,190,\"1\",0,1,1,\"Obs: ${sanitizeText(payload.observations ?? "", 28)}\"`,
      `TEXT 20,215,\"1\",0,1,1,\"Resp: ${sanitizeText(payload.userName ?? "", 24)}\"`,
    ],
    copies,
  );
}

function buildTSPLFromStructured(
  template: PrintTemplate,
  payload: SamplePayload | ProductPayload | StockInTransitPayload,
  copies = 1,
): string {
  switch (template) {
    case "sample":
      return buildSampleTspl(payload as SamplePayload, copies);
    case "product":
      return buildProductTspl(payload as ProductPayload, copies);
    case "stock_in_transit":
      return buildStockInTransitTspl(payload as StockInTransitPayload, copies);
    default:
      return "";
  }
}

function buildTSPL(data: LegacyPrintJobVariables): string {
  return (
    `SIZE ${data.size}\r\n` +
    `GAP ${data.gap}\r\n` +
    `DIRECTION 0\r\nCLS\r\n\r\n` +
    `TEXT 20,125,\"3\",0,2,1,\"${data.productName}\"\r\n` +
    `TEXT 20,165,\"1\",0,1,1,\"Codigo: ${data.code}\"\r\n` +
    `TEXT 20,185,\"1\",0,1,1,\"Lote: ${data.lot}\"\r\n` +
    `TEXT 20,205,\"1\",0,1,1,\"Peso: ${data.weight}\"\r\n` +
    `TEXT 20,263,\"3\",0,2,1,\"${data.validity}\"\r\n` +
    `TEXT 20,315,\"1\",0,1,1,\"Arm: ${data.storage}\"\r\n` +
    `TEXT 20,335,\"1\",0,1,1,\"Resp: ${data.responsible}\"\r\n` +
    `BARCODE 280,330,\"128\",50,1,0,1,2,\"${data.barcode}\"\r\n` +
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
    const structuredResult = StructuredPrintJobSchema.safeParse(body);

    let payload: {
      tenantId: string;
      printerName: string;
      printData: string;
    };

    if (structuredResult.success) {
      const normalizedCopies = normalizeCopies(structuredResult.data.copies);
      payload = {
        tenantId: structuredResult.data.organizationId,
        printerName: structuredResult.data.printerName,
        printData: buildTSPLFromStructured(
          structuredResult.data.template,
          structuredResult.data.payload,
          normalizedCopies,
        ),
      };
    } else {
      const rawResult = RawPrintJobSchema.safeParse(body);

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
    }

    const printServiceUrl = getPrintServiceActionUrl();

    const response = await fetch(printServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.PRINT_HUB_API_KEY || "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    console.log(`Print service response status: ${response.status}`);
    console.log(
      `Print service response headers: ${JSON.stringify(response.headers)}`,
    );
    console.log(
      `Print service response body: ${await response.clone().text()}`,
    );
    const responseText = await response.text();
    let responseBody: unknown = null;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = { raw: responseText };
      }
    }
    console.log(
      `Parsed print service response body: ${JSON.stringify(responseBody)}`,
    );
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
