import axios from "axios";
import { format } from "date-fns";

/**
 * Client-side facade for printing labels through the web BFF.
 * The browser never talks to the Hub directly; the Next.js route
 * adds the API key and forwards the raw TSPL to the Hub.
 */
export class LabelPrinterService {
  private static readonly BASE_URL = "/api/print-service";

  private static formatDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
      if (dateStr.includes("-") && dateStr.length === 10) {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return format(date, "dd/MM/yyyy");
      }
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  }

  private static sanitizeText(value?: string, maxLength = 32): string {
    if (!value) return "-";
    return value.replace(/["\r\n]+/g, " ").trim().slice(0, maxLength) || "-";
  }

  private static buildTsplLabel(lines: string[]): string {
    return [
      'SIZE 60 mm, 60 mm',
      'GAP 3 mm, 0 mm',
      'DIRECTION 0',
      'CLS',
      '',
      ...lines,
      '',
      'PRINT 1',
      '',
    ].join('\r\n');
  }

  private static async postPrintJob(
    printerName: string,
    organizationId: string,
    printData: string,
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        this.BASE_URL,
        {
          organizationId,
          printerName,
          printData,
        },
        {
          validateStatus: () => true,
        },
      );

      if (response.status < 200 || response.status >= 300) {
        console.error("Failed to print label:", response.data);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to print label:", error);
      return false;
    }
  }

  static async printStockInTransitLabel(
    data: {
      productName: string;
      quantity: number;
      unit: string;
      manufacturingDate: string;
      validityDate: string;
      observations?: string;
      userName?: string;
    },
    printerName: string,
    organizationId: string,
  ): Promise<boolean> {
    const printData = this.buildTsplLabel([
      `TEXT 20,20,"2",0,1,1,"ESTOQUE EM TRANSITO"`,
      `BOX 15,45,435,48,2`,
      `TEXT 20,65,"3",0,2,1,"${this.sanitizeText(data.productName, 24)}"`,
      `TEXT 20,115,"1",0,1,1,"Qtd: ${data.quantity} ${this.sanitizeText(data.unit, 10)}"`,
      `TEXT 20,140,"1",0,1,1,"Fab: ${this.formatDate(data.manufacturingDate)}"`,
      `TEXT 20,165,"1",0,1,1,"Val: ${this.formatDate(data.validityDate)}"`,
      `TEXT 20,190,"1",0,1,1,"Obs: ${this.sanitizeText(data.observations, 28)}"`,
      `TEXT 20,215,"1",0,1,1,"Resp: ${this.sanitizeText(data.userName, 24)}"`,
    ]);

    return this.postPrintJob(printerName, organizationId, printData);
  }

  static async printSampleLabel(
    data: {
      sampleName: string;
      collectionTime: string;
      collectionDate: string;
      discardDate: string;
      responsibleName: string;
    },
    printerName: string,
    organizationId: string,
  ): Promise<boolean> {
    const printData = this.buildTsplLabel([
      `TEXT 20,20,"2",0,1,1,"AMOSTRA"`,
      `BOX 15,45,435,48,2`,
      `TEXT 20,65,"3",0,2,1,"${this.sanitizeText(data.sampleName, 24)}"`,
      `TEXT 20,115,"1",0,1,1,"Hora: ${this.sanitizeText(data.collectionTime, 8)}"`,
      `TEXT 20,140,"1",0,1,1,"Coleta: ${this.formatDate(data.collectionDate)}"`,
      `TEXT 20,165,"1",0,1,1,"Descarte: ${this.formatDate(data.discardDate)}"`,
      `TEXT 20,190,"1",0,1,1,"Resp: ${this.sanitizeText(data.responsibleName, 24)}"`,
    ]);

    return this.postPrintJob(printerName, organizationId, printData);
  }

  static async printProductLabel(
    data: {
      productName: string;
      manufacturingDate: string;
      validityDate: string;
      openingDate?: string;
      validityAfterOpening?: string;
      conservationMode: "REFRIGERADO" | "CONGELADO" | "AMBIENTE";
      responsibleName: string;
    },
    printerName: string,
    organizationId: string,
  ): Promise<boolean> {
    const printData = this.buildTsplLabel([
      `TEXT 20,20,"2",0,1,1,"ETIQUETA PRODUTO"`,
      `BOX 15,45,435,48,2`,
      `TEXT 20,65,"3",0,2,1,"${this.sanitizeText(data.productName, 24)}"`,
      `TEXT 20,115,"1",0,1,1,"Fab: ${this.formatDate(data.manufacturingDate)}"`,
      `TEXT 20,140,"1",0,1,1,"Val: ${this.formatDate(data.validityDate)}"`,
      `TEXT 20,165,"1",0,1,1,"Abert: ${this.formatDate(data.openingDate || '')}"`,
      `TEXT 20,190,"1",0,1,1,"Pos-abert: ${this.formatDate(data.validityAfterOpening || '')}"`,
      `TEXT 20,215,"1",0,1,1,"Arm: ${this.sanitizeText(data.conservationMode, 18)}"`,
      `TEXT 20,240,"1",0,1,1,"Resp: ${this.sanitizeText(data.responsibleName, 24)}"`,
    ]);

    return this.postPrintJob(printerName, organizationId, printData);
  }

  static async checkStatus(): Promise<boolean> {
    try {
      const response = await axios.get("/api/devices/printers", {
        validateStatus: () => true,
      });
      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    }
  }
}
