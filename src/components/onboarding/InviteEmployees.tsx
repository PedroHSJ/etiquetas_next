"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Mail, X, Users, ChefHat, Package, CheckCircle } from "lucide-react";
import { InviteService } from "@/lib/services/inviteService";
import { Perfil } from "@/types/onboarding";
import { toast } from "sonner";

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
    if (invites.some(inv => inv.email === currentEmail && inv.perfil === currentPerfil)) {
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
        await InviteService.createInvite(
          invite.email,
          organizationId,
          invite.perfil,
          userId
        );
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
    const perfil = perfis.find(p => p.id === perfilId);
    return perfil?.nome === 'cozinheiro' ? ChefHat : Package;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          ← Voltar
        </Button>
      )}
      
      <div className="text-center mb-6 sm:mb-8">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          UAN Criada com Sucesso! 🎉
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-2">
          <strong>{organizationName}</strong> foi configurada
        </p>
        <p className="text-sm sm:text-base text-muted-foreground">
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
            Envie convites para cozinheiros e estoquistas se juntarem à sua UAN.
            Eles receberão um email com instruções para aceitar o convite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Formulário para adicionar convites */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <Label htmlFor="perfil" className="mb-2">Perfil</Label>
                  <Select value={currentPerfil} 
                    onValueChange={setCurrentPerfil}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfis.map((perfil) => (
                        <SelectItem key={perfil.id} value={perfil.id}>
                          <div className="flex items-center gap-2">
                            {perfil.nome.toLowerCase() === 'cozinheiro' ? (
                              <ChefHat className="h-4 w-4" />
                            ) : perfil.nome.toLowerCase() === 'estoquista' ? (
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
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Convite
              </Button>
            </div>

            {/* Lista de convites adicionados */}
            {invites.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-4">
                    Convites a Enviar ({invites.length})
                  </h3>
                  <div className="space-y-3">
                    {invites.map((invite, index) => {
                      const Icon = getPerfilIcon(invite.perfil);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{invite.email}</p>
                              <Badge variant="outline" className="text-xs">
                                {perfis.find(p => p.id === invite.perfil)?.nome || 'Perfil Desconhecido'}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvite(index)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
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
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button
                variant="outline"
                onClick={onSkip}
                disabled={sending}
              >
                Pular por Agora
              </Button>
              
                {invites.length > 0 && (
                  <Button
                    onClick={sendInvites}
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Convites
                      </>
                    )}
                  </Button>
                )}
            </div>

            {/* Informação adicional */}
            <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
              <p className="font-medium mb-2">ℹ️ Informações sobre os convites:</p>
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
