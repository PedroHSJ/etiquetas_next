"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
// import { useOrganization } from "./OrganizationContext";

// Definindo tipos compatíveis com o uso atual ou adaptando
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Session {
  user: User;
  accessToken?: string; // Better auth usa cookie, mas para manter compatibilidade de tipo se precisar
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userId: string;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  // linkWithEmail: (email: string, password: string) => Promise<void>; // Better auth link logic might differ
  signOut: () => Promise<void>;
  // sendPasswordResetEmail: (email: string) => Promise<void>; // Better auth reset password logic
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fetchSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await authClient.getSession();

      if (data) {
        // @ts-ignore
        setSession(data);
        // @ts-ignore
        setUser(data.user);
        setUserId(data.user.id);
      } else {
        setSession(null);
        setUser(null);
        setUserId("");
      }
    } catch (error) {
      console.error("Erro inesperado ao buscar sessão:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth/verify",
      });
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
      setUser(null);
      setUserId("");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Login com e-mail e senha
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      console.log(error);
      throw error;
    }
    await fetchSession();
    router.push("/auth/verify"); // Redireciona para verificação de onboarding
  };

  // Cadastro com e-mail e senha
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
  ) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (error) throw error;
    await fetchSession();
    // @ts-ignore
    return { user: data?.user, session: data?.session };
  };

  const value = {
    user,
    session,
    userId,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    // linkWithEmail, // Removido temporariamente
    signOut,
    // sendPasswordResetEmail, // Removido temporariamente
  };

  return (
    <AuthContext.Provider value={value as any}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
