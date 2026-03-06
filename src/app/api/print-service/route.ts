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

const OrganizationPayloadSchema = z.object({
  organizationName: z.string().optional().nullable(),
  organizationCnpj: z.string().optional().nullable(),
  organizationZipCode: z.string().optional().nullable(),
  organizationAddress: z.string().optional().nullable(),
  organizationNumber: z.string().optional().nullable(),
  organizationAddressComplement: z.string().optional().nullable(),
  organizationCity: z.string().optional().nullable(),
  organizationState: z.string().optional().nullable(),
});

const QuantityPayloadSchema = z.object({
  quantity: z.number().positive(),
  unit: z.string().min(1, "unit is required"),
});

const SamplePayloadSchema = OrganizationPayloadSchema.extend({
  sampleName: z.string().min(1, "sampleName is required"),
  collectionAt: z.string().min(1, "collectionAt is required"),
  discardAt: z.string().min(1, "discardAt is required"),
  shift: z.string().optional().nullable(),
  responsibleName: z.string().min(1, "responsibleName is required"),
}).extend(QuantityPayloadSchema.shape);

const OpenedProductPayloadSchema = OrganizationPayloadSchema.extend({
  productName: z.string().min(1, "productName is required"),
  openedAt: z.string().min(1, "openedAt is required"),
  originalValidityDate: z.string().min(1, "originalValidityDate is required"),
  validityDate: z.string().min(1, "validityDate is required"),
  conservationMode: z.enum(["REFRIGERADO", "CONGELADO", "AMBIENTE"]),
  responsibleName: z.string().min(1, "responsibleName is required"),
}).extend(QuantityPayloadSchema.shape);

const ThawingPayloadSchema = OrganizationPayloadSchema.extend({
  productName: z.string().min(1, "productName is required"),
  startAt: z.string().min(1, "startAt is required"),
  validityDate: z.string().min(1, "validityDate is required"),
  responsibleName: z.string().min(1, "responsibleName is required"),
  lot: z.string().optional().nullable(),
}).extend(QuantityPayloadSchema.shape);

const ManipulatedPayloadSchema = OrganizationPayloadSchema.extend({
  preparationName: z.string().min(1, "preparationName is required"),
  handledAt: z.string().min(1, "handledAt is required"),
  validityDate: z.string().min(1, "validityDate is required"),
  conservationMode: z.enum(["REFRIGERADO", "CONGELADO", "AMBIENTE"]),
  responsibleName: z.string().min(1, "responsibleName is required"),
}).extend(QuantityPayloadSchema.shape);

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
    template: z.literal("opened_product"),
    copies: z.number().int().min(1).optional(),
    payload: OpenedProductPayloadSchema,
  }),
  z.object({
    printerName: z.string().min(1, "printerName is required"),
    organizationId: z.string().min(1, "organizationId is required"),
    template: z.literal("thawing"),
    copies: z.number().int().min(1).optional(),
    payload: ThawingPayloadSchema,
  }),
  z.object({
    printerName: z.string().min(1, "printerName is required"),
    organizationId: z.string().min(1, "organizationId is required"),
    template: z.literal("manipulated"),
    copies: z.number().int().min(1).optional(),
    payload: ManipulatedPayloadSchema,
  }),
]);

type LegacyPrintJobVariables = z.infer<typeof LegacyPrintJobSchema>;

type StructuredPrintJob = z.infer<typeof StructuredPrintJobSchema>;

type PrintTemplate = StructuredPrintJob["template"];

type SamplePayload = z.infer<typeof SamplePayloadSchema>;

type OrganizationPayload = z.infer<typeof OrganizationPayloadSchema>;

type OpenedProductPayload = z.infer<typeof OpenedProductPayloadSchema>;

type ThawingPayload = z.infer<typeof ThawingPayloadSchema>;

type ManipulatedPayload = z.infer<typeof ManipulatedPayloadSchema>;

type LabelDetailRow = {
  label: string;
  value: string;
};

function formatConservationModeLabel(
  mode: "REFRIGERADO" | "CONGELADO" | "AMBIENTE",
): string {
  return mode === "AMBIENTE" ? "T° AMBIENTE" : mode;
}

function normalizeCopies(copies?: number): number {
  if (!Number.isFinite(copies)) return 1;
  return Math.max(1, Math.floor(copies as number));
}

function sanitizeText(value?: string | null, maxLength = 32): string {
  if (!value) return "-";
  return (
    value
      .replace(/["\r\n]+/g, " ")
      .trim()
      .slice(0, maxLength) || "-"
  );
}

function normalizeLabelText(value?: string | null, maxLength = 32): string {
  if (!value) return "";
  const cleaned = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return sanitizeText(cleaned, maxLength).toUpperCase();
}

type LabelTextSize = "xs" | "sm" | "md" | "lg" | "xl";

const TSPL_TEXT_SIZES: Record<
  LabelTextSize,
  { font: string; xMul: number; yMul: number }
> = {
  xs: { font: "1", xMul: 1, yMul: 1 },
  sm: { font: "1", xMul: 1, yMul: 1 },
  md: { font: "2", xMul: 1, yMul: 1 },
  lg: { font: "3", xMul: 1, yMul: 1 },
  xl: { font: "4", xMul: 1, yMul: 1 },
};

type TsplTextOptions = {
  bold?: boolean;
  xMul?: number;
  yMul?: number;
};

function tsplText(
  x: number,
  y: number,
  label: string,
  size: LabelTextSize = "md",
  options?: TsplTextOptions,
): string[] {
  const { font, xMul, yMul } = TSPL_TEXT_SIZES[size];
  const scaleX = options?.xMul ?? xMul;
  const scaleY = options?.yMul ?? yMul;
  const line = `TEXT ${x},${y},"${font}",0,${scaleX},${scaleY},"${label}"`;
  if (options?.bold) {
    return [
      line,
      `TEXT ${x + 1},${y},"${font}",0,${scaleX},${scaleY},"${label}"`,
    ];
  }
  return [line];
}

const TSPL_FONT_WIDTH: Record<string, number> = {
  "1": 8,
  "2": 12,
  "3": 16,
  "4": 24,
  "5": 32,
};

function estimateTextWidth(
  label: string,
  size: LabelTextSize,
  options?: TsplTextOptions,
): number {
  if (!label) return 0;
  const { font, xMul } = TSPL_TEXT_SIZES[size];
  const scaleX = options?.xMul ?? xMul;
  const fontWidth = TSPL_FONT_WIDTH[font] ?? 10;
  return label.length * fontWidth * scaleX;
}

function tsplTextRight(
  xRight: number,
  y: number,
  label: string,
  size: LabelTextSize = "md",
  options?: TsplTextOptions,
): string[] {
  const width = estimateTextWidth(label, size, options);
  const x = Math.max(0, Math.round(xRight - width));
  return tsplText(x, y, label, size, options);
}

function splitLabelLines(
  value: string,
  maxLen: number,
  maxLines = 2,
): string[] {
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
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch.map(Number);
      const date = new Date(year, month - 1, day);
      return formatDateValue(date);
    }

    const parsed = new Date(dateStr);
    return formatDateValue(parsed);
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";

  const dateTimeMatch = dateStr.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (dateTimeMatch) {
    const [, year, month, day, hour, minute] = dateTimeMatch;
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

  return formatDate(dateStr);
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
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatCepValue(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length != 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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

function getOrganizationFooter(payload: OrganizationPayload): {
  organizationName: string;
  organizationLines: string[];
} {
  const organizationName = normalizeLabelText(payload.organizationName ?? "", 28);
  const cnpj = normalizeLabelText(
    formatCnpjValue(payload.organizationCnpj ?? ""),
    28,
  );
  const address = normalizeLabelText(payload.organizationAddress ?? "", 28);
  const number = normalizeLabelText(payload.organizationNumber ?? "", 10);
  const complement = normalizeLabelText(
    payload.organizationAddressComplement ?? "",
    18,
  );
  const city = normalizeLabelText(payload.organizationCity ?? "", 18);
  const state = normalizeLabelText(payload.organizationState ?? "", 6);
  const zip = normalizeLabelText(
    formatCepValue(payload.organizationZipCode ?? ""),
    12,
  );

  const addressLine =
    [address, number].filter(Boolean).join(", ") +
    (complement ? ` - ${complement}` : "");
  const cityStateLine = [city, state].filter(Boolean).join("/");
  const zipLine = zip ? `CEP: ${zip}` : "";
  const cnpjLine = cnpj ? `CNPJ: ${cnpj}` : "";
  const cnpjCepLine = [cnpjLine, zipLine].filter(Boolean).join(" ");

  const organizationLines = [cnpjCepLine, addressLine, cityStateLine]
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    organizationName,
    organizationLines,
  };
}

function buildOperationalLabelTspl(config: {
  title: string;
  primaryText: string;
  rows: LabelDetailRow[];
  responsibleName: string;
  organization: OrganizationPayload;
  copies?: number;
}): string {
  const xOffset = 16;
  const yOffset = 16;
  const boxLeft = xOffset + 24;
  const boxRight = xOffset + 424;
  const rowHeight = 26;
  const titleY = 18;
  const divider1Y = 46;
  const primaryTextY = 60;
  const primaryTextSpacing = 28;
  const useBold = false;
  const primaryText = normalizeLabelText(config.primaryText, 28);
  const primaryLines = splitLabelLines(primaryText, 18, 2);
  const normalizedRows = config.rows.filter((row) => row.value.trim().length > 0);
  const detailsStartY =
    primaryTextY + (primaryLines.length || 1) * primaryTextSpacing + 14;
  const divider2Y = detailsStartY + normalizedRows.length * rowHeight + 6;
  const responsibleY = divider2Y + 12;
  const { organizationName, organizationLines } = getOrganizationFooter(
    config.organization,
  );
  const hasOrganizationName = Boolean(organizationName);
  const organizationNameY = responsibleY + rowHeight;
  const organizationDetailsY =
    organizationNameY + (hasOrganizationName ? rowHeight : 0);

  const detailLines = normalizedRows.flatMap((row, index) => {
    const y = yOffset + detailsStartY + index * rowHeight;
    return [
      ...tsplText(
        xOffset + 24,
        y,
        sanitizeText(row.label, 16),
        "md",
        { bold: useBold },
      ),
      ...tsplTextRight(
        boxRight,
        y,
        sanitizeText(row.value, 20),
        "md",
        { bold: false },
      ),
    ];
  });

  const responsibleLabel = "RESP:";
  const responsibleLabelX = xOffset + 24;
  const responsibleValueX =
    responsibleLabelX +
    estimateTextWidth(responsibleLabel, "md", { bold: useBold }) +
    16;
  const responsibleText = normalizeLabelText(config.responsibleName, 24);

  const organizationTextLines = organizationLines.flatMap((line, index) => {
    const y = yOffset + organizationDetailsY + index * rowHeight;
    return tsplText(xOffset + 24, y, sanitizeText(line, 42), "sm", {
      bold: useBold,
    });
  });

  const primaryTextLines = (primaryLines.length ? primaryLines : [primaryText]).flatMap(
    (line, index) =>
      tsplText(
        xOffset + 24,
        yOffset + primaryTextY + index * primaryTextSpacing,
        sanitizeText(line, 18),
        "lg",
        { bold: true },
      ),
  );

  return buildTsplLabel(
    [
      ...tsplText(
        xOffset + 24,
        yOffset + titleY,
        normalizeLabelText(config.title, 24),
        "md",
        {
          bold: true,
        },
      ),
      `BOX ${boxLeft},${yOffset + divider1Y},${boxRight},${yOffset + divider1Y + 2},1`,
      ...primaryTextLines,
      ...detailLines,
      `BOX ${boxLeft},${yOffset + divider2Y},${boxRight},${yOffset + divider2Y + 2},1`,
      ...tsplText(
        responsibleLabelX,
        yOffset + responsibleY,
        responsibleLabel,
        "md",
        {
          bold: useBold,
        },
      ),
      ...tsplText(
        responsibleValueX,
        yOffset + responsibleY,
        responsibleText,
        "md",
        {
          bold: false,
        },
      ),
      ...(hasOrganizationName
        ? tsplText(
            xOffset + 24,
            yOffset + organizationNameY,
            organizationName,
            "sm",
            {
              bold: useBold,
            },
          )
        : []),
      ...organizationTextLines,
    ],
    config.copies,
  );
}

function buildSampleTspl(payload: SamplePayload, copies = 1): string {
  const quantity = normalizeLabelText(
    `${payload.quantity} ${sanitizeText(payload.unit, 10)}`,
    18,
  );
  const rows: LabelDetailRow[] = [
    {
      label: "COLETA:",
      value: formatDateTime(payload.collectionAt),
    },
    {
      label: "DESCARTE:",
      value: formatDateTime(payload.discardAt),
    },
    ...(payload.shift
      ? [
          {
            label: "TURNO:",
            value: normalizeLabelText(payload.shift, 18),
          },
        ]
      : []),
    {
      label: "QTD:",
      value: quantity,
    },
  ];

  return buildOperationalLabelTspl({
    title: "AMOSTRA",
    primaryText: payload.sampleName,
    rows,
    responsibleName: payload.responsibleName,
    organization: payload,
    copies,
  });
}

function buildOpenedProductTspl(
  payload: OpenedProductPayload,
  copies = 1,
): string {
  const quantity = normalizeLabelText(
    `${payload.quantity} ${sanitizeText(payload.unit, 10)}`,
    18,
  );
  const rows: LabelDetailRow[] = [
    {
      label: "ABERTO:",
      value: formatDateTime(payload.openedAt),
    },
    {
      label: "VAL. ORIG.:",
      value: formatDate(payload.originalValidityDate),
    },
    {
      label: "VALIDADE:",
      value: formatDateTime(payload.validityDate),
    },
    {
      label: "CONSERV.:",
      value: normalizeLabelText(
        formatConservationModeLabel(payload.conservationMode),
        18,
      ),
    },
    {
      label: "QTD:",
      value: quantity,
    },
  ];

  return buildOperationalLabelTspl({
    title: "PRODUTO ABERTO",
    primaryText: payload.productName,
    rows,
    responsibleName: payload.responsibleName,
    organization: payload,
    copies,
  });
}

function buildThawingTspl(payload: ThawingPayload, copies = 1): string {
  const quantity = normalizeLabelText(
    `${payload.quantity} ${sanitizeText(payload.unit, 10)}`,
    18,
  );
  const rows: LabelDetailRow[] = [
    {
      label: "INICIO:",
      value: formatDateTime(payload.startAt),
    },
    {
      label: "FIM:",
      value: formatDateTime(payload.validityDate),
    },
    ...(payload.lot
      ? [
          {
            label: "LOTE:",
            value: normalizeLabelText(payload.lot, 18),
          },
        ]
      : []),
    {
      label: "QTD:",
      value: quantity,
    },
  ];

  return buildOperationalLabelTspl({
    title: "DESCONGELO",
    primaryText: payload.productName,
    rows,
    responsibleName: payload.responsibleName,
    organization: payload,
    copies,
  });
}

function buildManipulatedTspl(
  payload: ManipulatedPayload,
  copies = 1,
): string {
  const quantity = normalizeLabelText(
    `${payload.quantity} ${sanitizeText(payload.unit, 10)}`,
    18,
  );
  const rows: LabelDetailRow[] = [
    {
      label: "FABRIC.:",
      value: formatDateTime(payload.handledAt),
    },
    {
      label: "VALIDADE:",
      value: formatDateTime(payload.validityDate),
    },
    {
      label: "CONSERV.:",
      value: normalizeLabelText(
        formatConservationModeLabel(payload.conservationMode),
        18,
      ),
    },
    {
      label: "QTD:",
      value: quantity,
    },
  ];

  return buildOperationalLabelTspl({
    title: "MANIPULADO",
    primaryText: payload.preparationName,
    rows,
    responsibleName: payload.responsibleName,
    organization: payload,
    copies,
  });
}

function buildTSPLFromStructured(
  template: PrintTemplate,
  payload:
    | SamplePayload
    | OpenedProductPayload
    | ThawingPayload
    | ManipulatedPayload,
  copies = 1,
): string {
  switch (template) {
    case "sample":
      return buildSampleTspl(payload as SamplePayload, copies);
    case "opened_product":
      return buildOpenedProductTspl(payload as OpenedProductPayload, copies);
    case "thawing":
      return buildThawingTspl(payload as ThawingPayload, copies);
    case "manipulated":
      return buildManipulatedTspl(payload as ManipulatedPayload, copies);
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
