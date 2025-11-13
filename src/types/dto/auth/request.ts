/**
 * Auth API Request DTOs
 */

/**
 * DTO for user login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * DTO for user registration
 */
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

/**
 * DTO for password reset request
 */
export interface ResetPasswordRequestDto {
  email: string;
}

/**
 * DTO for password reset confirmation
 */
export interface ResetPasswordConfirmDto {
  token: string;
  newPassword: string;
}

/**
 * DTO for sending invite
 */
export interface SendInviteDto {
  email: string;
  organizationId: string;
  profileId: string;
  senderName?: string;
}

/**
 * DTO for accepting invite
 */
export interface AcceptInviteDto {
  token: string;
  password?: string;
}
