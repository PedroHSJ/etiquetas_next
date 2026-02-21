"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo que os dados ficam em cache (1 minuto)
            staleTime: 1 * 60 * 1000,
            // Tempo que os dados inativos ficam em cache (3 minutos)
            gcTime: 3 * 60 * 1000,
            // Retry automático em caso de erro
            retry: 1,
            // Refetch automático ao focar na janela
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry automático para mutations
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
