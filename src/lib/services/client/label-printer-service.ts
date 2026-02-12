import axios from "axios";
import { format } from "date-fns";

/**
 * Service for interacting with the local label printer agent (usually running on port 5000)
 */
export class LabelPrinterService {
  private static readonly BASE_URL = "/api/labels";

  /**
   * Helper to format dates to DD/MM/YYYY
   */
  private static formatDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
      // Se for formato YYYY-MM-DD de inputs de data, evita problemas de timezone
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

  /**
   * Prints a label for a stock item in transit
   */
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
  ): Promise<boolean> {
    try {
      console.table(data);
      if (process.env.NODE_ENV === "development") {
        console.log("Mock print (dev):", data);
        return true;
      }

      const payload = {
        printerName,
        productName: data.productName,
        manufacturingDate: this.formatDate(data.manufacturingDate),
        validityDate: this.formatDate(data.validityDate),
        conservationMode: data.observations?.includes("CONGELADO")
          ? "CONGELADO"
          : data.observations?.includes("REFRIGERADO")
            ? "REFRIGERADO"
            : "AMBIENTE",
        responsibleName: data.userName || "N/A",
      };

      const response = await axios.post(`${this.BASE_URL}/print`, payload);
      return response.status === 200;
    } catch (error) {
      console.error("Failed to print label:", error);
      return false;
    }
  }

  /**
   * Prints a label for samples (AMOSTRAS)
   */
  static async printSampleLabel(
    data: {
      sampleName: string;
      collectionTime: string;
      collectionDate: string;
      discardDate: string;
      responsibleName: string;
    },
    printerName: string,
  ): Promise<boolean> {
    try {
      console.table(data);
      if (process.env.NODE_ENV === "development") {
        return true;
      }

      const payload = {
        printerName,
        productName: `AMOSTRA: ${data.sampleName} (${data.collectionTime})`,
        manufacturingDate: this.formatDate(data.collectionDate),
        validityDate: this.formatDate(data.discardDate),
        conservationMode: "REFRIGERADO", // Amostras geralmente refrigeradas
        responsibleName: data.responsibleName,
      };

      const response = await axios.post(`${this.BASE_URL}/print`, payload);
      return response.status === 200;
    } catch (error) {
      console.error("Failed to print sample label:", error);
      return false;
    }
  }

  /**
   * Prints a label for products (PRODUTOS)
   */
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
  ): Promise<boolean> {
    try {
      console.table(data);
      if (process.env.NODE_ENV === "development") {
        return true;
      }

      const payload = {
        printerName,
        productName: data.productName,
        manufacturingDate: this.formatDate(data.manufacturingDate),
        validityDate: this.formatDate(data.validityDate),
        conservationMode: data.conservationMode,
        responsibleName: data.responsibleName,
      };

      const response = await axios.post(`${this.BASE_URL}/print`, payload);
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
