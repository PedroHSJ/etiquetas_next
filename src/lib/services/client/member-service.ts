import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { MemberResponseDto } from "@/types/dto/member/response";

export const MemberService = {
  async listByOrganization(
    organizationId: string,
  ): Promise<MemberResponseDto[]> {
    if (!organizationId) {
      return [];
    }

    const { data } = await api.get<ApiResponse<MemberResponseDto[]>>(
      "/members",
      {
        params: { organizationId },
      },
    );

    if (!data?.data) {
      throw new Error("Não foi possível carregar os membros");
    }

    return data.data;
  },
};
