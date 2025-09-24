import { supabase } from "@/lib/supabaseClient";
import { Label, LabelTemplate, LabelType } from "@/types/etiquetas";

export class LabelService {
  // Templates
  static async getTemplates(organizationId: string): Promise<LabelTemplate[]> {
    const { data, error } = await supabase
      .from("label_templates")
      .select("*")
      .eq("organization_id", organizationId)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  static async getTemplate(id: string): Promise<LabelTemplate | null> {
    const { data, error } = await supabase
      .from("label_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getDefaultTemplate(
    organizationId: string,
    labelType: LabelType
  ): Promise<LabelTemplate | null> {
    const { data, error } = await supabase
      .from("label_templates")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("label_type", labelType)
      .eq("is_default", true)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Ignore "not found" error
    return data;
  }

  static async createTemplate(
    template: Omit<LabelTemplate, "id" | "created_at" | "updated_at">
  ): Promise<LabelTemplate> {
    const { data, error } = await supabase
      .from("label_templates")
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTemplate(
    id: string,
    updates: Partial<LabelTemplate>
  ): Promise<LabelTemplate> {
    const { data, error } = await supabase
      .from("label_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from("label_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async setDefaultTemplate(
    organizationId: string,
    templateId: string,
    labelType: LabelType
  ): Promise<void> {
    // Primeiro, remove o padrão de outros templates do mesmo tipo
    await supabase
      .from("label_templates")
      .update({ is_default: false })
      .eq("organization_id", organizationId)
      .eq("label_type", labelType);

    // Depois, define o novo padrão
    const { error } = await supabase
      .from("label_templates")
      .update({ is_default: true })
      .eq("id", templateId);

    if (error) throw error;
  }

  // Etiquetas
  static async getLabels(
    organizationId: string,
    filters?: {
      labelType?: LabelType;
      productId?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
    }
  ): Promise<Label[]> {
    let query = supabase
      .from("labels")
      .select(
        `
        *,
        template:label_templates(*),
        product:products(id, name, category:product_categories(name))
      `
      )
      .eq("organization_id", organizationId);

    if (filters?.labelType) {
      query = query.eq("label_type", filters.labelType);
    }

    if (filters?.productId) {
      query = query.eq("product_id", filters.productId);
    }

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    query = query.order("created_at", { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getLabel(id: string): Promise<Label | null> {
    const { data, error } = await supabase
      .from("labels")
      .select(
        `
        *,
        template:label_templates(*),
        product:products(id, name, category:product_categories(name))
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createLabel(
    label: Omit<Label, "id" | "created_at" | "updated_at" | "print_count">
  ): Promise<Label> {
    // Gerar QR code único
    const qrCode = `ETQ-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const labelData = {
      ...label,
      qr_code: qrCode,
      print_count: 0,
    };

    const { data, error } = await supabase
      .from("labels")
      .insert(labelData)
      .select(
        `
        *,
        template:label_templates(*),
        product:products(id, name, category:product_categories(name))
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLabel(
    id: string,
    updates: Partial<Label>
  ): Promise<Label> {
    const { data, error } = await supabase
      .from("labels")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        template:label_templates(*),
        product:products(id, name, category:product_categories(name))
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteLabel(id: string): Promise<void> {
    const { error } = await supabase.from("labels").delete().eq("id", id);

    if (error) throw error;
  }

  static async markAsPrinted(
    id: string,
    printedBy: string,
    quantityPrinted: number = 1
  ): Promise<void> {
    // Atualizar contador de impressões na etiqueta
    const { error: labelError } = await supabase
      .from("labels")
      .update({
        print_count: supabase.rpc("increment", { by: quantityPrinted }),
        printed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (labelError) throw labelError;

    // Registrar no histórico de impressões
    const { error: printError } = await supabase.from("label_prints").insert({
      label_id: id,
      printed_by: printedBy,
      quantity_printed: quantityPrinted,
      printed_at: new Date().toISOString(),
    });

    if (printError) throw printError;
  }

  // Dashboard e Relatórios
  static async getExpiringLabels(
    organizationId: string,
    days: number = 3
  ): Promise<Label[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const { data, error } = await supabase
      .from("labels")
      .select(
        `
        *,
        template:label_templates(*),
        product:products(id, name, category:product_categories(name))
      `
      )
      .eq("organization_id", organizationId)
      .lte("expiry_date", targetDate.toISOString().split("T")[0])
      .gte("expiry_date", new Date().toISOString().split("T")[0])
      .order("expiry_date");

    if (error) throw error;
    return data || [];
  }

  static async getExpiredLabels(organizationId: string): Promise<Label[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("labels")
      .select(
        `
        *,
        template:label_templates(*),
        product:products(id, name, category:product_categories(name))
      `
      )
      .eq("organization_id", organizationId)
      .lt("expiry_date", today)
      .order("expiry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getLabelStats(organizationId: string) {
    const { data: labels, error } = await supabase
      .from("labels")
      .select("label_type, expiry_date, created_at")
      .eq("organization_id", organizationId);

    if (error) throw error;

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const stats = {
      total: labels?.length || 0,
      byType: {} as Record<LabelType, number>,
      expiredYesterday: 0,
      expiringToday: 0,
      expiringTomorrow: 0,
      createdToday: 0,
    };

    labels?.forEach((label: { label_type: LabelType; expiry_date: string; created_at: string }) => {
      // Contagem por tipo
      stats.byType[label.label_type as LabelType] =
        (stats.byType[label.label_type as LabelType] || 0) + 1;

      // Etiquetas vencendo
      if (label.expiry_date === yesterdayStr) stats.expiredYesterday++;
      if (label.expiry_date === today) stats.expiringToday++;
      if (label.expiry_date === tomorrowStr) stats.expiringTomorrow++;

      // Criadas hoje
      if (label.created_at?.startsWith(today)) stats.createdToday++;
    });

    return stats;
  }
}
