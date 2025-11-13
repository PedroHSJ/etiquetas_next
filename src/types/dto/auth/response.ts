/**
 * Auth API Response DTOs
 */

/**
 * User response
 */
export interface UserResponseDto {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Auth response
 */
export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Login response
 */
export interface LoginResponseDto {
  success: boolean;
  data?: AuthResponseDto;
  error?: string;
  message?: string;
}

/**
 * Register response
 */
export interface RegisterResponseDto {
  success: boolean;
  data?: AuthResponseDto;
  error?: string;
  message?: string;
}

/**
 * Invite response
 */
export interface InviteResponseDto {
  id: string;
  email: string;
  organizationId: string;
  profileId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Send invite response
 */
export interface SendInviteResponseDto {
  success: boolean;
  data?: InviteResponseDto;
  error?: string;
  message?: string;
}
