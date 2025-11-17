"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Package,
  CheckCircle,
  Clock,
  Info,
  LogOut,
  XCircle,
} from "lucide-react";
import { OrganizationWizard } from "@/components/wizard/OrganizationWizard";
import { InviteEmployees } from "@/components/onboarding/InviteEmployees";
import { InvitedBy } from "@/components/onboarding/InvitedBy";
import { InviteService } from "@/lib/services/inviteService";
import { OnboardingChoice } from "@/types/onboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { supabase } from "@/lib/supabaseClient";
import { Invite } from "@/types/models/invite";

export default function OnboardingPage() {
  const [acceptingInvite, setAcceptingInvite] = useState<string | null>(null);
  const [rejectingInvite, setRejectingInvite] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user } = useAuth();
  const { invites, loading, hasOrganization, refreshInvites, removeInvite } =
    useOnboarding();
  const {
    state,
    setChoice,
    setWizardComplete,
    setInvitesComplete,
    addAcceptedInvite,
    resetToChoice,
    resetToWizard,
    clearOnboardingState,
  } = useOnboardingState();
  const router = useRouter();
  const { isNavigating, setIsNavigating } = useNavigation();
  const { refreshAll } = useProfile();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setLoggingOut(false);
    }
  };

  // Função para formatar nome do perfil
  const formatProfileName = (profileName?: string) => {
    if (!profileName) return "Perfil";

    const profileMap: Record<string, string> = {
      gestor: "Gestor",
      cozinheiro: "Cozinheiro",
      estoquista: "Estoquista",
      master: "Master",
    };

    return profileMap[profileName.toLowerCase()] || profileName;
  };

  // Redirecionamento automático para dashboard se não houver convites
  useEffect(() => {
    if (
      !loading &&
      invites.length === 0 &&
      state.choice?.tipo === "funcionario"
    ) {
      console.log("Redirecionamento automático em 5 segundos...");
      const timer = setTimeout(() => {
        console.log("Redirecionando para dashboard...");
        refreshAll();
        router.push("/dashboard");
      }, 5000);

      return () => {
        console.log("Limpando timer de redirecionamento");
        clearTimeout(timer);
      };
    }
  }, [loading, invites.length, state.choice?.tipo, router]);

  const handleChoice = (
    tipo: "gestor" | "funcionario",
    perfil?: "cozinheiro" | "estoquista"
  ) => {
    setChoice({ tipo, perfil });
  };

  const handleAcceptInvite = async (convite: Invite) => {
    if (!user?.id) return;

    try {
      setAcceptingInvite(convite.id);
      await InviteService.acceptInvite(convite.inviteToken);
      toast.success("Convite aceito com sucesso!");

      // Adicionar convite aceito ao estado
      addAcceptedInvite(convite.id);

      // Redirecionar para dashboard
      refreshAll();
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      toast.error("Erro ao aceitar convite");
    } finally {
      setAcceptingInvite(null);
    }
  };

  const handleRejectInvite = async (convite: Invite) => {
    if (!user?.id) return;

    try {
      setRejectingInvite(convite.id);
      await InviteService.rejectInvite(convite.id);
      toast.success("Convite recusado com sucesso!");
      removeInvite(convite.id);
      await refreshInvites();
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
      toast.error("Erro ao recusar convite");
    } finally {
      setRejectingInvite(null);
    }
  };

  const handleWizardComplete = (orgId: string, orgName: string) => {
    setWizardComplete(orgId, orgName);
  };

  const handleInvitesComplete = () => {
    clearOnboardingState();
    refreshAll();
    router.push("/dashboard");
  };

  const handleSkipInvites = () => {
    clearOnboardingState();
    refreshAll();
    setIsNavigating(true);
    router.push("/dashboard");
  };

  const handleBack = () => {
    if (state.step === "invites") {
      resetToWizard();
    } else {
      resetToChoice();
    }
  };

  // Renderização baseada no step atual
  if (state.step === "invites" && state.organizationData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>
          {!isNavigating && (
            <InviteEmployees
              organizationId={state.organizationData.id}
              organizationName={state.organizationData.name}
              userId={user?.id || ""}
              onComplete={handleInvitesComplete}
              onSkip={handleSkipInvites}
              onBack={handleBack}
            />
          )}

          {isNavigating && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Redirecionando...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.step === "wizard" && state.choice?.tipo === "gestor") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={handleBack}>
              ← Voltar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>
          <OrganizationWizard
            userId={user?.id || ""}
            onComplete={handleWizardComplete}
          />
        </div>
      </div>
    );
  }

  if (state.choice?.tipo === "funcionario") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 px-4 sm:py-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <Button variant="ghost" onClick={handleBack}>
              ← Voltar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                Bem-vindo como Funcionário!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Você foi convidado para participar de uma UAN. Aceite um dos
                convites abaixo para começar.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Carregando convites...
                </p>
              </div>
            ) : invites.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum convite encontrado
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Você ainda não recebeu convites para participar de UANs.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        refreshAll();
                        router.push("/dashboard");
                      }}
                      className="w-full sm:w-auto"
                    >
                      Ir para Dashboard
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Você será redirecionado automaticamente em 5 segundos...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <Card key={invite.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="text-base sm:text-lg font-medium">
                              {invite.organization?.name || "UAN"}
                            </h3>
                          </div>
                          <Badge variant="outline" className="w-fit">
                            {formatProfileName(invite.profile?.name)}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <InvitedBy
                            user={{
                              id: invite.invitedBy.id,
                              name:
                                invite.invitedBy.name ||
                                invite.invitedBy.email ||
                                "Usuário",
                              email: invite.invitedBy.email || "",
                              avatarUrl: invite.invitedBy.avatarUrl,
                            }}
                            isLoading={loading}
                          />
                          <p>
                            <strong>Data do convite:</strong>{" "}
                            {new Date(invite.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                          <p>
                            <strong>Expira em:</strong>{" "}
                            {new Date(invite.expiresAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:min-w-[120px]">
                        <Button
                          onClick={() => handleAcceptInvite(invite)}
                          disabled={
                            acceptingInvite === invite.id ||
                            rejectingInvite === invite.id
                          }
                          className="w-full sm:w-auto"
                        >
                          {acceptingInvite === invite.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Aceitando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aceitar
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleRejectInvite(invite)}
                          disabled={
                            acceptingInvite === invite.id ||
                            rejectingInvite === invite.id
                          }
                          className="w-full sm:w-auto"
                        >
                          {rejectingInvite === invite.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground mr-2"></div>
                              Recusando...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Recusar
                            </>
                          )}
                        </Button>

                        {new Date(invite.expiresAt) < new Date() && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expirado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>

          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Bem-vindo ao Sistema de Gestão de UANs!
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Como você gostaria de começar?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Opção Gestor */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col"
              onClick={() => handleChoice("gestor")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Gestor</CardTitle>
                <CardDescription className="text-base">
                  Cadastre e gerencie sua própria empresa e suas Unidades de
                  Alimentação e Nutrição
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
                  <li>• Configure setores e departamentos</li>
                  <li>• Gerencie funcionários e convites</li>
                  <li>• Acesso completo ao sistema</li>
                  <li>• Relatórios e análises</li>
                </ul>
                <Button size="lg" className="w-full mt-auto">
                  Começar como Gestor
                </Button>
              </CardContent>
            </Card>

            {/* Opção Funcionário */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col"
              onClick={() => handleChoice("funcionario")}
            >
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  {" "}
                  <div className="p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                    {" "}
                    <Users className="h-8 w-8 text-primary" />{" "}
                  </div>{" "}
                  {!loading && invites.length > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold border border-background">
                      {" "}
                      {invites.length > 99 ? "99+" : invites.length}{" "}
                    </div>
                  )}{" "}
                </div>
                <CardTitle className="text-2xl">Funcionário</CardTitle>
                <CardDescription className="text-base">
                  Participe de uma UAN existente através de convites
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                {!loading && (
                  <div className="mb-3 flex justify-center">
                    <Badge
                      variant={invites.length > 0 ? "default" : "outline"}
                      className="px-3 py-1 text-xs"
                    >
                      {invites.length} convite
                      {invites.length === 1 ? "" : "s"} pendente
                      {invites.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                )}
                <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
                  <li>• Aceite convites recebidos</li>
                  <li>• Perfis: Cozinheiro ou Estoquista</li>
                  <li>• Acesso específico às funções</li>
                  <li>• Integração com a equipe</li>
                </ul>
                <Button size="lg" variant="outline" className="w-full mt-auto">
                  Ver Convites
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* {invites.length > 0 && (
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Você tem {invites.length} convite{invites.length > 1 ? "s" : ""}{" "}
                pendente{invites.length > 1 ? "s" : ""}
              </p>
              <Button
                variant="outline"
                onClick={() => handleChoice("funcionario")}
                className="w-full sm:w-auto"
              >
                Ver Convites Pendentes
              </Button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
