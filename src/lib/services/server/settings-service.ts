import { prisma } from "@/lib/prisma";

export class SettingsBackendService {
  /**
   * Gets a specific setting for an organization
   */
  static async getSetting(
    organizationId: string,
    key: string,
  ): Promise<string | null> {
    try {
      const setting = await prisma.organization_settings.findUnique({
        where: {
          organizationId_settingKey: {
            organizationId,
            settingKey: key,
          },
        },
        select: {
          settingValue: true,
        },
      });

      return setting?.settingValue || null;
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
      await prisma.organization_settings.upsert({
        where: {
          organizationId_settingKey: {
            organizationId,
            settingKey: key,
          },
        },
        update: {
          settingValue: value,
          updatedAt: new Date(),
        },
        create: {
          organizationId,
          settingKey: key,
          settingValue: value,
        },
      });

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
