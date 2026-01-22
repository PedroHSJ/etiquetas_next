import axios from "axios";

/**
 * Service for interacting with the local label printer agent (usually running on port 5000)
 */
export class LabelPrinterService {
  private static readonly BASE_URL = "http://localhost:5000";

  /**
   * Prints a label for a stock item in transit
   */
  static async printStockInTransitLabel(data: {
    productName: string;
    quantity: number;
    unit: string;
    manufacturingDate: string;
    validityDate: string;
    observations?: string;
    userName?: string;
  }): Promise<boolean> {
    try {
      console.table(data);
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      const response = await axios.post(`${this.BASE_URL}/print`, {
        type: "STOCK_IN_TRANSIT",
        data: {
          ...data,
          printedAt: new Date().toISOString(),
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error("Failed to print label:", error);
      // We don't throw here to allow the UI to handle it as a soft failure if needed
      return false;
    }
  }

  /**
   * Prints a label for samples (AMOSTRAS)
   * Fields: Amostra, Horário, Data da coleta, Data do descarte, Responsável
   * Note: "Obs: Descarte após 72 horas" is printed on the label
   */
  static async printSampleLabel(data: {
    sampleName: string;
    collectionTime: string;
    collectionDate: string;
    discardDate: string;
    responsibleName: string;
  }): Promise<boolean> {
    try {
      console.table(data);
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      const response = await axios.post(`${this.BASE_URL}/print`, {
        type: "SAMPLE",
        data: {
          ...data,
          observation: "Descarte após 72 horas",
          printedAt: new Date().toISOString(),
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error("Failed to print sample label:", error);
      return false;
    }
  }

  /**
   * Prints a label for products (PRODUTOS)
   * Fields: Produto, Dt FAB, Dt VAL, Dt ABERTURA, Dt VAL (após abertura),
   *         Modo de conservação (REFRIGERADO/CONGELADO/T° AMBIENTE), Responsável
   */
  static async printProductLabel(data: {
    productName: string;
    manufacturingDate: string;
    validityDate: string;
    openingDate?: string;
    validityAfterOpening?: string;
    conservationMode: "REFRIGERADO" | "CONGELADO" | "AMBIENTE";
    responsibleName: string;
  }): Promise<boolean> {
    try {
      console.table(data);
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      const response = await axios.post(`${this.BASE_URL}/print`, {
        type: "PRODUCT",
        data: {
          ...data,
          printedAt: new Date().toISOString(),
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error("Failed to print product label:", error);
      return false;
    }
  }

  /**
   * Checks if the printer service is available
   */
  static async checkStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.BASE_URL}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
