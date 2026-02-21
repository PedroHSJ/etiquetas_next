/**
 * Validates CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;

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

/**
 * Formats CNPJ
 */
export function formatCNPJ(cnpj?: string | null): string {
  if (!cnpj) return "";
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return cnpj;
  return cleanCnpj.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  );
}

/**
 * Formats Phone
 */
export function formatPhone(telefone?: string | null): string {
  if (!telefone) return "";
  const cleanTelefone = telefone.replace(/\D/g, "");
  if (cleanTelefone.length === 11) {
    return cleanTelefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleanTelefone.length === 10) {
    return cleanTelefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}
