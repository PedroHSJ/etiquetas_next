import { Organization } from "@/types";
import { convertKeysToCamel } from "@/utils/caseConverter";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const OrganizationService = {
  async getOrganizations(userId: string): Promise<Organization[]> {
    const response = await fetch(
      `${projectUrl}/rest/v1/organizacoes?user_id=eq.${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch organizations");
    }

    const organizations = await response.json();
    return convertKeysToCamel<Organization[]>(organizations);
  },
};
