"use client";

interface InvitedByProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  isLoading?: boolean;
  compact?: boolean; // Nova prop para versão compacta
}

export function InvitedBy({
  user,
  isLoading = false,
  compact = false,
}: InvitedByProps) {
  if (isLoading || !user) {
    return (
      <p
        className={
          compact
            ? "text-xs text-muted-foreground"
            : "text-sm text-muted-foreground"
        }
      >
        <strong>Convidado por:</strong>{" "}
        <span className="inline-block h-4 w-20 bg-gray-200 animate-pulse rounded"></span>
      </p>
    );
  }

  // Gerar iniciais para avatar
  const initials = user.name
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Gerar cor baseada no nome
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  return (
    <div
      className={`flex items-center gap-2 ${
        compact ? "text-xs" : "text-sm"
      } text-muted-foreground`}
    >
      <strong>Convidado por:</strong>
      <div className="flex items-center gap-2">
        <div
          className={`${
            compact ? "w-5 h-5" : "w-6 h-6"
          } rounded-full flex items-center justify-center text-xs text-white font-medium`}
          style={{ backgroundColor: getAvatarColor(user.name) }}
          title={`${user.name} (${user.email})`}
        >
          {initials}
        </div>
        <span className={`font-medium ${compact ? "truncate max-w-20" : ""}`}>
          {user.name}
        </span>
      </div>
    </div>
  );
}
