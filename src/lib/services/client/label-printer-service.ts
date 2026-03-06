import axios from "axios";

/**
 * Client-side facade for printing labels through the web BFF.
 * The browser never talks to the Hub directly; the Next.js route
 * adds the API key and forwards the raw TSPL to the Hub.
 */
export class LabelPrinterService {
  private static readonly BASE_URL = "/api/print-service";

  private static normalizeCopies(copies?: number): number {
    if (!Number.isFinite(copies)) return 1;
    return Math.max(1, Math.floor(copies as number));
  }

  private static async postPrintJob<TPayload>(
    printerName: string,
    organizationId: string,
    template: "sample" | "product" | "stock_in_transit",
    payload: TPayload,
    copies = 1,
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        this.BASE_URL,
        {
          organizationId,
          printerName,
          template,
          payload,
          copies: this.normalizeCopies(copies),
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
    copies = 1,
  ): Promise<boolean> {
    return this.postPrintJob(
      printerName,
      organizationId,
      "stock_in_transit",
      data,
      copies,
    );
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
    copies = 1,
  ): Promise<boolean> {
    return this.postPrintJob(
      printerName,
      organizationId,
      "sample",
      data,
      copies,
    );
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
      organizationName?: string;
      organizationCnpj?: string;
      organizationZipCode?: string;
      organizationAddress?: string;
      organizationNumber?: string;
      organizationAddressComplement?: string;
      organizationCity?: string;
      organizationState?: string;
      quantity: number;
      unit: string;
    },
    printerName: string,
    organizationId: string,
    copies = 1,
  ): Promise<boolean> {
    return this.postPrintJob(
      printerName,
      organizationId,
      "product",
      data,
      copies,
    );
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
