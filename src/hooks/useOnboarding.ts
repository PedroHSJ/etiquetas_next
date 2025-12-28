import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { InviteService } from "@/lib/services/client/invite-service";
import { Invite } from "@/types/models/invite";

interface OnboardingStatus {
  invites: Invite[];
  hasOrganization: boolean;
}

const defaultStatus: OnboardingStatus = {
  invites: [],
  hasOrganization: false,
};

export const useOnboarding = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const onboardingQuery = useQuery({
    queryKey: ["onboarding-status", userId],
    enabled: !!userId,
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!userId) {
        return defaultStatus;
      }

      const [hasOrganization, invites] = await Promise.all([
        InviteService.checkUserOrganization(userId),
        InviteService.getPendingInvites(),
      ]);

      return { hasOrganization, invites };
    },
    staleTime: 60 * 1000,
  });

  const refreshInvites = async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({
      queryKey: ["onboarding-status", userId],
    });
  };

  const removeInvite = (inviteId: string) => {
    if (!userId) return;
    queryClient.setQueryData<OnboardingStatus | undefined>(
      ["onboarding-status", userId],
      (prev) =>
        prev
          ? {
              ...prev,
              invites: prev.invites.filter((invite) => invite.id !== inviteId),
            }
          : prev
    );
  };

  return {
    invites: onboardingQuery.data?.invites ?? [],
    hasOrganization: onboardingQuery.data?.hasOrganization ?? false,
    loading: onboardingQuery.isLoading,
    refreshInvites,
    removeInvite,
    checkUserStatus: onboardingQuery.refetch,
  };
};
