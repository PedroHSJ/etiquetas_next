"use client";

interface ConvidadoPorProps {
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  isLoading?: boolean;
  compact?: boolean; // Nova prop para versão compacta
}

export function ConvidadoPor({ usuario, isLoading = false, compact = false }: ConvidadoPorProps) {
  if (isLoading || !usuario) {
    return (
      <p className={compact ? "text-muted-foreground text-xs" : "text-muted-foreground text-sm"}>
        <strong>Convidado por:</strong>{" "}
        <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200"></span>
      </p>
    );
  }

  // Gerar iniciais para avatar
  const initials = usuario.nome
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
      className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"} text-muted-foreground`}
    >
      <strong>Convidado por:</strong>
      <div className="flex items-center gap-2">
        <div
          className={`${compact ? "h-5 w-5" : "h-6 w-6"} flex items-center justify-center rounded-full text-xs font-medium text-white`}
          style={{ backgroundColor: getAvatarColor(usuario.nome) }}
          title={`${usuario.nome} (${usuario.email})`}
        >
          {initials}
        </div>
        <span className={`font-medium ${compact ? "max-w-20 truncate" : ""}`}>{usuario.nome}</span>
      </div>
    </div>
  );
}
