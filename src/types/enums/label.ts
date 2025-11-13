/**
 * Label-related enums
 */

/**
 * Label status
 */
export enum LabelStatus {
  PRINTED = "printed",
  USED = "used",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

/**
 * Label types (for different label formats)
 */
export enum LabelType {
  OPENED_PRODUCT = "produto_aberto",
  MANIPULATED = "manipulado",
  THAWED = "descongelo",
  SAMPLE = "amostra",
}
