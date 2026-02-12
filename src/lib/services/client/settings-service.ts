import { supabase } from "@/lib/supabaseClient";

export class SettingsService {
  /**
   * Gets a specific setting for an organization
   */
  static async getSetting(
    organizationId: string,
    key: string,
  ): Promise<string | null> {
    try {
      const { data, error } = await (
        supabase.from("organization_settings") as any
      )
        .select("setting_value")
        .eq("organization_id", organizationId)
        .eq("setting_key", key)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data?.setting_value || null;
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
      const { error } = await (
        supabase.from("organization_settings") as any
      ).upsert(
        {
          organization_id: organizationId,
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,setting_key" },
      );

      if (error) throw error;
      return true;
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
