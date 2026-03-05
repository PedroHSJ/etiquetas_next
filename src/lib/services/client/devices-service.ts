import apiClient from "@/lib/apiClient";

export interface PrinterInfo {
  printerName: string;
  driverName?: string;
  portName?: string;
  isDefault?: boolean;
  status?: string;
}

export class DevicesService {
  /**
   * Fetches the currently connected local physical printers for the current restaurant/tenant.
   * Leverages the BFF (Backend-For-Frontend) route which knows the active organization.
   */
  static async getConnectedPrinters(): Promise<PrinterInfo[]> {
    try {
      const { data } = await apiClient.get<PrinterInfo[]>("/devices/printers");
      return data || [];
    } catch (error) {
      console.error("Error fetching connected printers:", error);
      return [];
    }
  }

  /**
   * Generates a long-lived JWT token tied to the current restaurant/tenant for MSI installation.
   * This calls the BFF route which injects the strong ClientSecret automatically.
   */
  static async generateInstallationToken(): Promise<string | null> {
    try {
      const { data } = await apiClient.post<{ token: string }>(
        "/devices/token",
        {},
      );
      return data?.token || null;
    } catch (error) {
      console.error("Error generating installation token:", error);
      return null;
    }
  }
}
