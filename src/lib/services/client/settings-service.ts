import axios from "axios";

export class SettingsService {
  /**
   * Gets a specific setting for an organization
   */
  static async getSetting(
    organizationId: string,
    key: string,
  ): Promise<string | null> {
    try {
      const response = await axios.get("/api/settings", {
        params: { organizationId, key },
      });
      return response.data.value;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Sets or updates a setting for an organization
   */
  static async setSetting(
    organizationId: string,
    key: string,
    value: string,
  ): Promise<boolean> {
    try {
      const response = await axios.post("/api/settings", {
        organizationId,
        key,
        value,
      });
      return response.data.success;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Gets the printer name for an organization
   */
  static async getPrinterName(organizationId: string): Promise<string | null> {
    return await this.getSetting(organizationId, "printer_name");
  }
}
