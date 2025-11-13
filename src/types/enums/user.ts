/**
 * User and permission-related enums
 */

/**
 * User profile/role names
 */
export enum ProfileName {
  ADMIN = "admin",
  MANAGER = "gestor",
  OPERATOR = "operador",
  VIEWER = "visualizador",
}

/**
 * Permission actions
 */
export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXECUTE = "execute",
}

/**
 * User organization status
 */
export enum UserOrganizationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  BLOCKED = "blocked",
}

/**
 * Invite status
 */
export enum InviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}
