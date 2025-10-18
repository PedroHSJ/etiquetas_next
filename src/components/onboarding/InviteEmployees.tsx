"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Mail, X, Users, ChefHat, Package, CheckCircle } from "lucide-react";
import { InviteService } from "@/lib/services/inviteService";
import { Perfil } from "@/types/permissions";
import { toast } from "sonner";
import { useNavigation } from "@/contexts/NavigationContext";

interface InviteEmployeesProps {
  organizationId: string;
  organizationName: string;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

interface NewInvite {
  email: string;
  perfil: string;
}

export function InviteEmployees({
  organizationId,
  organizationName,
  userId,
  onComplete,
  onSkip,
  onBack,
}: InviteEmployeesProps) {
  const [invites, setInvites] = useState<NewInvite[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPerfil, setCurrentPerfil] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const { isNavigating } = useNavigation();
  // Carregar perfis de funcionários (excluir gestor)
  useEffect(() => {
    const loadPerfis = async () => {
      try {
        const allPerfis = await InviteService.getPerfis();
        //const funcionarioPerfis = allPerfis.filter(p => p.nome.toLowerCase() !== 'gestor');
        setPerfis(allPerfis);
      } catch (error) {
        console.error("Erro ao carregar perfis:", error);
      }
    };
    loadPerfis();
  }, []);

  const addInvite = () => {
    if (!currentEmail || !currentPerfil) {
      toast.error("Preencha todos os campos");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentEmail)) {
      toast.error("Email inválido");
      return;
    }

    // Verificar se email já foi adicionado
    if (invites.some((inv) => inv.email === currentEmail && inv.perfil === currentPerfil)) {
      toast.error("Este email já foi adicionado");
      return;
    }

    setInvites([...invites, { email: currentEmail, perfil: currentPerfil }]);
    setCurrentEmail("");
    setCurrentPerfil("");
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const sendInvites = async () => {
    if (invites.length === 0) {
      toast.error("Adicione pelo menos um convite");
      return;
    }

    try {
      setSending(true);

      // Enviar todos os convites
      for (const invite of invites) {
        await InviteService.createInvite(invite.email, organizationId, invite.perfil, userId);
      }

      toast.success(`${invites.length} convite(s) enviado(s) com sucesso!`);
      onComplete();
    } catch (error) {
      console.error("Erro ao enviar convites:", error);
      toast.error("Erro ao enviar convites");
    } finally {
      setSending(false);
    }
  };

  const getPerfilIcon = (perfilId: string) => {
    const perfil = perfis.find((p) => p.id === perfilId);
    return perfil?.nome === "cozinheiro" ? ChefHat : Package;
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Voltar
        </Button>
      )}

      <div className="mb-6 text-center sm:mb-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 p-3 sm:h-16 sm:w-16">
          <CheckCircle className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
        </div>
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">UAN Criada com Sucesso! 🎉</h1>
        <p className="text-muted-foreground mb-2 text-base sm:text-lg">
          <strong>{organizationName}</strong> foi configurada
        </p>
        <p className="text-muted-foreground text-sm sm:text-base">
          Agora você pode convidar funcionários para participar da sua UAN
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Convidar Funcionários
          </CardTitle>
          <CardDescription>
            Envie convites para cozinheiros e estoquistas se juntarem à sua UAN. Eles receberão um
            email com instruções para aceitar o convite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Formulário para adicionar convites */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email do Funcionário</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="funcionario@exemplo.com"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && currentEmail && currentPerfil) {
                        addInvite();
                      }
                    }}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="perfil" className="mb-2">
                    Perfil
                  </Label>
                  <Select value={currentPerfil} onValueChange={setCurrentPerfil}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfis.map((perfil) => (
                        <SelectItem key={perfil.id} value={perfil.id}>
                          <div className="flex items-center gap-2">
                            {perfil.nome.toLowerCase() === "cozinheiro" ? (
                              <ChefHat className="h-4 w-4" />
                            ) : perfil.nome.toLowerCase() === "estoquista" ? (
                              <Package className="h-4 w-4" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                            {perfil.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={addInvite}
                disabled={!currentEmail || !currentPerfil}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Convite
              </Button>
            </div>

            {/* Lista de convites adicionados */}
            {invites.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-4 font-medium">Convites a Enviar ({invites.length})</h3>
                  <div className="space-y-3">
                    {invites.map((invite, index) => {
                      const Icon = getPerfilIcon(invite.perfil);
                      return (
                        <div
                          key={index}
                          className="bg-secondary/50 flex items-center justify-between rounded-lg p-3"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Icon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{invite.email}</p>
                              <Badge variant="outline" className="text-xs">
                                {perfis.find((p) => p.id === invite.perfil)?.nome ||
                                  "Perfil Desconhecido"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvite(index)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Botões de ação */}
            <Separator />
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <Button variant="outline" onClick={onSkip} disabled={sending || isNavigating}>
                Pular por Agora
              </Button>

              {invites.length > 0 && (
                <Button onClick={sendInvites} disabled={sending}>
                  {sending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Convites
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Informação adicional */}
            <div className="text-muted-foreground rounded-lg bg-blue-50 p-4 text-sm">
              <p className="mb-2 font-medium">ℹ️ Informações sobre os convites:</p>
              <ul className="space-y-1">
                <li>• Os convites expiram em 7 dias</li>
                <li>• Os funcionários receberão um email com instruções</li>
                <li>• Você pode enviar mais convites depois através do painel de administração</li>
                <li>• Cada funcionário precisa criar uma conta para aceitar o convite</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
