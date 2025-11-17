import type { SupabaseClient } from "@supabase/supabase-js";
import { InviteEntity } from "@/types/database/invite";
import crypto from "crypto";
import {
  InviteWithRelationsResponseDto,
} from "@/types/dto/invite";
import { toInviteWithRelationsResponseDto } from "@/lib/converters/invite";
interface ListInvitesOptions {
  email?: string;
  status?: string;
  organizationId?: string;
}

interface CreateInviteData {
  email: string;
  organizationId: string;
  profileId: string;
  invitedBy: string;
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  invitedByAvatarUrl?: string | null;
}

interface AcceptInviteData {
  inviteToken: string;
  userId: string;
}

/**
 * Service layer for invite management (backend)
 */
export class InviteBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * List invites with filters
   */
  async listInvites(
    options: ListInvitesOptions = {}
  ): Promise<InviteWithRelationsResponseDto[]> {
    const { email, status, organizationId } = options;

    let query = this.supabase
      .from("invites")
      .select(
        `
        *,
        organization:organizations!invites_organization_id_fkey(name, type),
        profile:profiles!invites_profile_id_fkey(id, name, description)
      `
      )
      .order("created_at", { ascending: false });

    if (email) {
      query = query.eq("email", email);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message || "Error fetching invites");
    }

    const entities = (data ?? []) as InviteEntity[];
    return entities.map(toInviteWithRelationsResponseDto);
  }

  /**
   * Get pending invites for an email
   */
  async getPendingInvites(
    email: string
  ): Promise<InviteWithRelationsResponseDto[]> {
    const { data, error } = await this.supabase
      .from("invites")
      .select(
        `
        *,
        organization:organizations!invites_organization_id_fkey(name, type),
        profile:profiles!invites_profile_id_fkey(id, name, description)
      `
      )
      .eq("email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Error fetching pending invites");
    }

    const entities = (data ?? []) as InviteEntity[];
    return entities.map(toInviteWithRelationsResponseDto);
  }

  /**
   * Create a new invite
   */
  async createInvite(
    inviteData: CreateInviteData
  ): Promise<InviteWithRelationsResponseDto> {
    const inviteToken =
      crypto?.randomUUID?.() ||
      Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const { data, error } = await this.supabase
      .from("invites")
      .insert({
        email: inviteData.email,
        organization_id: inviteData.organizationId,
        profile_id: inviteData.profileId,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        invited_by: inviteData.invitedBy,
        invited_by_name: inviteData.invitedByName ?? null,
        invited_by_email: inviteData.invitedByEmail ?? null,
        invited_by_avatar_url: inviteData.invitedByAvatarUrl ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error creating invite");
    }

    const entity = data as InviteEntity;
    return toInviteWithRelationsResponseDto(entity);
  }

  /**
   * Accept an invite
   */
  async acceptInvite(acceptData: AcceptInviteData): Promise<boolean> {
    const { inviteToken, userId } = acceptData;

    // First, fetch the invite
    const { data: invite, error: fetchError } = await this.supabase
      .from("invites")
      .select("*")
      .eq("invite_token", inviteToken)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !invite) {
      throw new Error("Invite not found or expired");
    }

    // Update invite status
    const { error: updateError } = await this.supabase
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq("id", invite.id);

    if (updateError) {
      throw new Error(updateError.message || "Error accepting invite");
    }

    // Add user to organization
    const { data: userOrgData, error: insertError } = await this.supabase
      .from("user_organizations")
      .insert({
        user_id: userId,
        organization_id: invite.organization_id,
        profile_id: invite.profile_id,
        active: true,
      })
      .select()
      .single();

    if (insertError || !userOrgData) {
      throw new Error(
        insertError?.message || "Error adding user to organization"
      );
    }

    // Create user profile record
    const { error: userProfileError } = await this.supabase
      .from("user_profiles")
      .insert({
        user_organization_id: userOrgData.id,
        profile_id: invite.profile_id,
        active: true,
      });

    if (userProfileError) {
      throw new Error(
        userProfileError.message || "Error creating user profile"
      );
    }

    return true;
  }

  /**
   * Reject an invite
   */
  async rejectInvite(inviteId: string, userId?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("invites")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        rejected_by: userId || null,
      })
      .eq("id", inviteId);

    if (error) {
      throw new Error(error.message || "Error rejecting invite");
    }

    return true;
  }

  /**
   * Cancel an invite
   */
  async cancelInvite(inviteId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("invites")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
      })
      .eq("id", inviteId);

    if (error) {
      throw new Error(error.message || "Error canceling invite");
    }

    return true;
  }
}
