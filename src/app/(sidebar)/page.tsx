"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar automaticamente para o dashboard
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground mt-2">Redirecionando para o dashboard...</p>
      </div>
    </div>
  );
}
