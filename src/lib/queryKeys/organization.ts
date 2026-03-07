export const organizationQueryKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationQueryKeys.all, "lists"] as const,
  currentUserList: (userId: string) =>
    [...organizationQueryKeys.lists(), "current-user", userId] as const,
  expandedUserList: (userId: string) =>
    [...organizationQueryKeys.lists(), "expanded-user", userId] as const,
  details: () => [...organizationQueryKeys.all, "details"] as const,
  detailExpanded: (organizationId: string) =>
    [...organizationQueryKeys.details(), "expanded", organizationId] as const,
};
