"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Package, CheckCircle, Clock, Info } from "lucide-react";
import { OrganizationWizard } from "@/components/wizard/OrganizationWizard";
import { InviteEmployees } from "@/components/onboarding/InviteEmployees";
import { ConvidadoPor } from "@/components/onboarding/ConvidadoPor";
import { InviteService } from "@/lib/services/inviteService";
import { Convite, OnboardingChoice } from "@/types/onboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";
import { useNavigation } from "@/contexts/NavigationContext";

export default function OnboardingPage() {
  const [acceptingInvite, setAcceptingInvite] = useState<string | null>(null);
  const { user } = useAuth();
  const { invites, loading, hasOrganization } = useOnboarding();
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
    if (!loading && invites.length === 0 && state.choice?.tipo === "funcionario") {
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

  const handleChoice = (tipo: "gestor" | "funcionario", perfil?: "cozinheiro" | "estoquista") => {
    setChoice({ tipo, perfil });
  };

  const handleAcceptInvite = async (convite: Convite) => {
    if (!user?.id) return;

    try {
      setAcceptingInvite(convite.id);
      await InviteService.acceptInvite(convite.token_invite, user.id);
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
      <div className="bg-background min-h-screen">
        <div className="container mx-auto py-6">
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
            <div className="py-12 text-center">
              <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground mt-2">Redirecionando...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.step === "wizard" && state.choice?.tipo === "gestor") {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto py-6">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            ← Voltar
          </Button>
          <OrganizationWizard userId={user?.id || ""} onComplete={handleWizardComplete} />
        </div>
      </div>
    );
  }

  if (state.choice?.tipo === "funcionario") {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 sm:mb-6">
            ← Voltar
          </Button>

          <div className="mx-auto max-w-4xl">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="mb-4 text-2xl font-bold sm:text-3xl">Bem-vindo como Funcionário!</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Você foi convidado para participar de uma UAN. Aceite um dos convites abaixo para
                começar.
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground mt-2">Carregando convites...</p>
              </div>
            ) : invites.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-medium">Nenhum convite encontrado</h3>
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
                    <p className="text-muted-foreground text-xs">
                      Você será redirecionado automaticamente em 5 segundos...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invites.map((convite) => (
                  <Card key={convite.id} className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="text-primary h-5 w-5" />
                            <h3 className="text-base font-medium sm:text-lg">
                              {convite.organizacao?.nome || "UAN"}
                            </h3>
                          </div>
                          <Badge variant="outline" className="w-fit">
                            {formatProfileName(convite.perfil?.nome)}
                          </Badge>
                        </div>

                        <div className="text-muted-foreground space-y-2 text-sm">
                          <ConvidadoPor
                            usuario={convite.convidado_por_usuario}
                            isLoading={!convite.convidado_por_usuario}
                          />
                          <p>
                            <strong>Data do convite:</strong>{" "}
                            {new Date(convite.created_at).toLocaleDateString("pt-BR")}
                          </p>
                          <p>
                            <strong>Expira em:</strong>{" "}
                            {new Date(convite.expira_em).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:min-w-[120px]">
                        <Button
                          onClick={() => handleAcceptInvite(convite)}
                          disabled={acceptingInvite === convite.id}
                          className="w-full sm:w-auto"
                        >
                          {acceptingInvite === convite.id ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                              Aceitando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aceitar
                            </>
                          )}
                        </Button>

                        {new Date(convite.expira_em) < new Date() && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Bem-vindo ao Sistema de Gestão de UANs!
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl">
              Como você gostaria de começar?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8">
            {/* Opção Gestor */}
            <Card
              className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => handleChoice("gestor")}
            >
              <CardHeader className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full p-3">
                  <Building2 className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Gestor</CardTitle>
                <CardDescription className="text-base">
                  Crie e gerencie sua própria Unidade de Alimentação e Nutrição
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-muted-foreground mb-6 space-y-2 text-sm">
                  <li>• Configure setores e departamentos</li>
                  <li>• Gerencie funcionários e convites</li>
                  <li>• Acesso completo ao sistema</li>
                  <li>• Relatórios e análises</li>
                </ul>
                <Button size="lg" className="w-full">
                  Começar como Gestor
                </Button>
              </CardContent>
            </Card>

            {/* Opção Funcionário */}
            <Card
              className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => handleChoice("funcionario")}
            >
              <CardHeader className="text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full p-3">
                  <Users className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Funcionário</CardTitle>
                <CardDescription className="text-base">
                  Participe de uma UAN existente através de convites
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-muted-foreground mb-6 space-y-2 text-sm">
                  <li>• Aceite convites recebidos</li>
                  <li>• Perfis: Cozinheiro ou Estoquista</li>
                  <li>• Acesso específico às funções</li>
                  <li>• Integração com a equipe</li>
                </ul>
                <Button size="lg" variant="outline" className="w-full">
                  Ver Convites
                </Button>
              </CardContent>
            </Card>
          </div>

          {invites.length > 0 && (
            <div className="mt-8 text-center sm:mt-12">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Você tem {invites.length} convite{invites.length > 1 ? "s" : ""} pendente
                {invites.length > 1 ? "s" : ""}
              </p>
              <Button
                variant="outline"
                onClick={() => handleChoice("funcionario")}
                className="w-full sm:w-auto"
              >
                Ver Convites Pendentes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
