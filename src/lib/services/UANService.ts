import { supabase } from "@/lib/supabaseClient";
import { OrganizacaoExpandida, OrganizacaoFormData } from "@/types/uan";
import { LocalidadeService } from "./LocalidadeService";

export class UANService {
  // Buscar organização por ID com todos os dados expandidos
  static async getOrganizacaoById(id: string): Promise<OrganizacaoExpandida | null> {
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select(
          `
          *,
          estado:estados(*),
          municipio:municipios(*, estado:estados(*))
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao buscar organização:", error);
      throw error;
    }
  }

  // Atualizar organização
  static async updateOrganizacao(
    id: string,
    data: Partial<OrganizacaoFormData>
  ): Promise<OrganizacaoExpandida> {
    try {
      // Preparar dados para atualização
      const updateData = {
        ...data,
        // Limpar telefones
        telefone_principal: data.telefone_principal?.replace(/\D/g, ""),
        telefone_secundario: data.telefone_secundario?.replace(/\D/g, ""),
        // Limpar CNPJ
        cnpj: data.cnpj?.replace(/\D/g, ""),
        // Limpar CEP
        cep: data.cep?.replace(/\D/g, ""),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedData, error } = await supabase
        .from("organizacoes")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          estado:estados(*),
          municipio:municipios(*, estado:estados(*))
        `
        )
        .single();

      if (error) throw error;

      return updatedData;
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
      throw error;
    }
  }

  // Buscar todas as organizações do usuário com dados expandidos
  static async getOrganizacoesByUserId(userId: string): Promise<OrganizacaoExpandida[]> {
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select(
          `
          *,
          estado:estados(*),
          municipio:municipios(*, estado:estados(*))
        `
        )
        .eq("user_id", userId)
        .order("nome");

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
      throw error;
    }
  }

  // Buscar ou criar município baseado no CEP (usa LocalidadeService)
  static async processarCEP(cep: string) {
    try {
      const municipioResponse = await LocalidadeService.buscarOuCriarMunicipio(cep);

      if (!municipioResponse) {
        throw new Error("CEP não encontrado");
      }

      // Busca dados adicionais do CEP
      const dadosCEP = await LocalidadeService.buscarCEP(cep);

      return {
        municipio: municipioResponse,
        endereco: dadosCEP?.logradouro || "",
        bairro: dadosCEP?.bairro || "",
        cep: LocalidadeService.formatarCEP(cep),
      };
    } catch (error) {
      console.error("Erro ao processar CEP:", error);
      throw error;
    }
  }

  // Validar CEP (delegado para LocalidadeService)
  static async validarCEP(cep: string) {
    try {
      const dadosCEP = await LocalidadeService.buscarCEP(cep);

      if (!dadosCEP) {
        throw new Error("CEP não encontrado");
      }

      return {
        cep: cep.replace(/\D/g, ""),
        endereco_completo: `${dadosCEP.logradouro}, ${dadosCEP.bairro}`,
        bairro: dadosCEP.bairro,
        cidade: dadosCEP.localidade,
        estado: dadosCEP.uf,
      };
    } catch (error) {
      console.error("Erro ao validar CEP:", error);
      throw error;
    }
  }

  // Validar CNPJ
  static validarCNPJ(cnpj: string): boolean {
    const cleanCnpj = cnpj.replace(/\D/g, "");

    if (cleanCnpj.length !== 14) return false;

    // Verificar se não são todos os mesmos dígitos
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;

    // Validar dígitos verificadores
    let soma = 0;
    let pos = 5;

    for (let i = 0; i < 12; i++) {
      soma += parseInt(cleanCnpj.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;

    if (parseInt(cleanCnpj.charAt(12)) !== digito1) return false;

    soma = 0;
    pos = 6;

    for (let i = 0; i < 13; i++) {
      soma += parseInt(cleanCnpj.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;

    return parseInt(cleanCnpj.charAt(13)) === digito2;
  }

  // Formatar CNPJ
  static formatarCNPJ(cnpj: string): string {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  // Formatar telefone
  static formatarTelefone(telefone: string): string {
    const cleanTelefone = telefone.replace(/\D/g, "");

    if (cleanTelefone.length === 11) {
      return cleanTelefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleanTelefone.length === 10) {
      return cleanTelefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
  }

  // Formatar CEP (delegado para LocalidadeService)
  static formatarCEP(cep: string): string {
    return LocalidadeService.formatarCEP(cep);
  }
}
