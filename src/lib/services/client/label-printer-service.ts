import axios from "axios";

type ConservationMode = "REFRIGERADO" | "CONGELADO" | "AMBIENTE";

type OrganizationPrintPayload = {
  organizationName?: string;
  organizationCnpj?: string;
  organizationZipCode?: string;
  organizationAddress?: string;
  organizationNumber?: string;
  organizationAddressComplement?: string;
  organizationCity?: string;
  organizationState?: string;
};

type LabelTemplate =
  | "sample"
  | "opened_product"
  | "thawing"
  | "manipulated";

export type SampleLabelPayload = OrganizationPrintPayload & {
  sampleName: string;
  collectionAt: string;
  discardAt: string;
  shift?: string;
  responsibleName: string;
  quantity: number;
  unit: string;
};

export type OpenedProductLabelPayload = OrganizationPrintPayload & {
  productName: string;
  openedAt: string;
  originalValidityDate: string;
  validityDate: string;
  conservationMode: ConservationMode;
  responsibleName: string;
  quantity: number;
  unit: string;
};

export type ThawingLabelPayload = OrganizationPrintPayload & {
  productName: string;
  startAt: string;
  validityDate: string;
  responsibleName: string;
  quantity: number;
  unit: string;
  lot?: string;
};

export type ManipulatedLabelPayload = OrganizationPrintPayload & {
  preparationName: string;
  handledAt: string;
  validityDate: string;
  conservationMode: ConservationMode;
  responsibleName: string;
  quantity: number;
  unit: string;
};

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
    template: LabelTemplate,
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

  static async printSampleLabel(
    data: SampleLabelPayload,
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

  static async printOpenedProductLabel(
    data: OpenedProductLabelPayload,
    printerName: string,
    organizationId: string,
    copies = 1,
  ): Promise<boolean> {
    return this.postPrintJob(
      printerName,
      organizationId,
      "opened_product",
      data,
      copies,
    );
  }

  static async printThawingLabel(
    data: ThawingLabelPayload,
    printerName: string,
    organizationId: string,
    copies = 1,
  ): Promise<boolean> {
    return this.postPrintJob(
      printerName,
      organizationId,
      "thawing",
      data,
      copies,
    );
  }

  static async printManipulatedLabel(
    data: ManipulatedLabelPayload,
    printerName: string,
    organizationId: string,
    copies = 1,
  ): Promise<boolean> {
    return this.postPrintJob(
      printerName,
      organizationId,
      "manipulated",
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
