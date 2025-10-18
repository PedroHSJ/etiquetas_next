import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PrintJobSchema = z.object({
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
});

type PrintJobVariables = z.infer<typeof PrintJobSchema>;

function buildTSPL(data: PrintJobVariables): string {
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
    const body = await req.json();
    const parseResult = PrintJobSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos", errors: parseResult.error.issues },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const printData = buildTSPL(data);

    const printServiceUrl = process.env.PRINT_SERVICE_URL || "http://localhost:5000/api/print";
    const response = await fetch(printServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ printerName: data.printerName, language: data.language, printData }),
    });

    const result = await response.json();

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao processar requisição.", error: String(error) },
      { status: 500 }
    );
  }
}
