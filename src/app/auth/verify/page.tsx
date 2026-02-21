"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyAuthPage() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const { hasOrganization, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Só processa quando ambos os loadings terminarem
    if (authLoading || onboardingLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (hasOrganization) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  }, [authLoading, onboardingLoading, user, hasOrganization, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <div className="text-center space-y-1">
          <p className="font-medium">Verificando sua conta</p>
          <p className="text-sm text-muted-foreground animate-pulse">
            Preparando seu ambiente...
          </p>
        </div>
      </div>
    </div>
  );
}
