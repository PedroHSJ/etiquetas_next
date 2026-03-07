"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/ui/navigation-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Mail, UserPlus, ArrowLeft, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { InviteService } from "@/lib/services/client/invite-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Profile } from "@/types/models/profile";
import { ProfileService } from "@/lib/services/client/profile-service";
import { ConvitesIcon } from "../page";

export default function CreateConvitePage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { selectedOrganization } = useOrganization();
  const { isGestor, loading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [perfis, setPerfis] = useState<Profile[]>([]);

  // Estados do formulário
  const [email, setEmail] = useState("");
  const [perfilId, setPerfilId] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState<Date | undefined>(
    undefined,
  );
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (selectedOrganization) {
      fetchPerfis();
    }
  }, [selectedOrganization]);

  const fetchPerfis = async () => {
    try {
      // Buscar perfis disponíveis (excluindo master)
      const data = await ProfileService.getProfiles();
      const filtered = data.filter(
        (profile) => profile.name.toLowerCase() !== "master",
      );
      setPerfis(filtered);
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      toast.error("Erro ao carregar perfis");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrganization || !email || !perfilId || !dataExpiracao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await InviteService.createInvite({
        email: email.trim(),
        organizationId: selectedOrganization.id,
        profileId: perfilId,
        invitedBy: userId,
      });

      toast.success("Convite enviado com sucesso!");
      router.push("/convites");
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      toast.error("Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  if (permissionsLoading) {
    return null;
  }

  if (!isGestor()) {
    return (
      <div className="flex items-center justify-center p-4 text-center">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-red-600">
            Acesso Negado
          </div>
          <div className="text-sm text-muted-foreground">
            Apenas gestores podem criar novos convites.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <NavigationButton href="/convites" variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </NavigationButton>
          <div className="flex items-center gap-3">
            <ConvitesIcon />
            <div>
              <h1 className="text-3xl font-bold">Convite</h1>
              <p className="text-muted-foreground">
                Convide novos usuários para {selectedOrganization?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informações do Convite
            </CardTitle>
            <CardDescription>
              Preencha os dados para enviar um convite por email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email do Convidado *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  O convite será enviado para este email
                </p>
              </div>

              {/* Perfil */}
              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil *</Label>
                <Select value={perfilId} onValueChange={setPerfilId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map((perfil) => (
                      <SelectItem
                        key={perfil.id}
                        value={perfil.id}
                        className="p-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{perfil.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {perfil.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Define as permissões e responsabilidades do usuário
                </p>
              </div>

              {/* Data de Expiração */}
              <div className="space-y-2">
                <Label>Data de Expiração *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataExpiracao && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataExpiracao ? (
                        format(dataExpiracao, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataExpiracao}
                      onSelect={setDataExpiracao}
                      disabled={(date) => date <= new Date()}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  O convite expira nesta data e não poderá mais ser aceito
                </p>
              </div>

              {/* Mensagem Opcional */}
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem (Opcional)</Label>
                <textarea
                  id="mensagem"
                  placeholder="Adicione uma mensagem personalizada para o convite..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-sm text-muted-foreground">
                  Mensagem que será incluída no email de convite
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <NavigationButton
                  href="/convites"
                  variant="outline"
                  className="order-2 sm:order-1"
                >
                  Cancelar
                </NavigationButton>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">📧 Email de Convite</h4>
                <p className="text-sm text-muted-foreground">
                  O usuário receberá um email com link para aceitar o convite
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">⏰ Expiração</h4>
                <p className="text-sm text-muted-foreground">
                  O convite expira na data selecionada e não pode ser usado após
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">✅ Aceitação</h4>
                <p className="text-sm text-muted-foreground">
                  Ao aceitar, o usuário será adicionado automaticamente à
                  organização
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">🔐 Perfil</h4>
                <p className="text-sm text-muted-foreground">
                  O perfil define as permissões e responsabilidades do usuário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
