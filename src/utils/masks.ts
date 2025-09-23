/**
 * Utilitários para aplicar máscaras de formatação em campos de entrada
 */

export const formatCNPJ = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 00.000.000/0000-00
  return numbers
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const formatTelefone = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara (00) 00000-0000 ou (00) 0000-0000
  if (numbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers
      .slice(0, 10)
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return numbers
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

export const formatCEP = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 00000-000
  return numbers
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2');
};

export const unformatCNPJ = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const unformatTelefone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const unformatCEP = (value: string): string => {
  return value.replace(/\D/g, '');
};