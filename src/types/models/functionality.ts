/**
 * Functionality Model - Frontend representation with Date objects
 */
export interface Functionality {
  id: string;
  name: string;
  description: string | null;
  code: string;
  active: boolean;
  createdAt: Date;
}

/**
 * Functionality codes enum for type safety
 */
export const FunctionalityCode = {
  // Dashboard
  DASHBOARD_MANAGER: "DASHBOARD:MANAGER",
  DASHBOARD_STOCK: "DASHBOARD:STOCK",
  DASHBOARD_KITCHEN: "DASHBOARD:KITCHEN",
  // Members
  MEMBERS_READ: "MEMBERS:READ",
  MEMBERS_WRITE: "MEMBERS:WRITE",
  // Invites
  INVITES_READ: "INVITES:READ",
  INVITES_WRITE: "INVITES:WRITE",
  // Organizations
  ORGANIZATIONS_READ: "ORGANIZATIONS:READ",
  ORGANIZATIONS_WRITE: "ORGANIZATIONS:WRITE",
  // Departments
  DEPARTMENTS_READ: "DEPARTMENTS:READ",
  DEPARTMENTS_WRITE: "DEPARTMENTS:WRITE",
  // Labels
  LABELS_READ: "LABELS:READ",
  LABELS_WRITE: "LABELS:WRITE",
  // Stock
  STOCK_READ: "STOCK:READ",
  STOCK_WRITE: "STOCK:WRITE",
  // Technical Sheets
  TECHNICAL_SHEETS_READ: "TECHNICAL_SHEETS:READ",
  TECHNICAL_SHEETS_WRITE: "TECHNICAL_SHEETS:WRITE",
} as const;

export type FunctionalityCodeType =
  (typeof FunctionalityCode)[keyof typeof FunctionalityCode];
