"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Dados da sessão:", data);

      if (error) {
        console.error("Erro ao recuperar sessão:", error);
        router.push("/login");
        return;
      }

      if (data?.session?.user) {
        console.log("Usuário autenticado:", data.session.user);

        // Verificar se o usuário já tem uma organização através de usuarios_organizacoes
        const { data: organizations, error: orgError } = await supabase
          .from("usuarios_organizacoes")
          .select("id")
          .eq("usuario_id", data.session.user.id)
          .eq("ativo", true)
          .limit(1);

        if (orgError) {
          console.error("Erro ao verificar organização:", orgError);
          router.push("/onboarding");
          return;
        }

        // Se não tem organização, é primeiro login
        if (!organizations || organizations.length === 0) {
          console.log("Primeiro login - redirecionando para onboarding");
          router.push("/onboarding");
        } else {
          console.log("Usuário já tem organização - redirecionando para dashboard");
          router.push("/dashboard");
        }
      } else {
        console.log("Usuário não autenticado, redirecionando para login");
        router.push("/login");
      }
    };

    console.log("Iniciando processo de autenticação...");
    handleAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-2">Carregando...</p>
      </div>
    </div>
  );
}
