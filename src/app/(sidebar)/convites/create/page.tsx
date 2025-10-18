"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/ui/navigation-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarIcon,
  Mail,
  UserPlus,
  Building,
  Shield,
  Info,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {} from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { InviteService } from "@/lib/services/inviteService";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useOrganization } from "@/contexts/OrganizationContext";

interface Perfil {
  id: string;
  nome: string;
  descricao: string;
}

export default function CreateConvitePage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { selectedOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [perfis, setPerfis] = useState<Perfil[]>([]);

  // Estados do formulário
  const [email, setEmail] = useState("");
  const [perfilId, setPerfilId] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState<Date | undefined>(undefined);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (selectedOrganization) {
      fetchPerfis();
    }
  }, [selectedOrganization]);

  const fetchPerfis = async () => {
    try {
      // Buscar perfis disponíveis (excluindo master)
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .neq("nome", "master")
        .eq("ativo", true);

      if (error) throw error;
      setPerfis(data || []);
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
      await InviteService.createInvite(email.trim(), selectedOrganization.id, perfilId, userId);

      toast.success("Convite enviado com sucesso!");
      router.push("/convites");
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      toast.error("Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard funcionalidade="Convites" acao="criar">
      <div className="flex flex-1 flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <NavigationButton href="/convites" variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </NavigationButton>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 4H12v8H9V2H4v10h3v8h5v-6h2l4 6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Criar Convite</h1>
              <p className="text-muted-foreground">
                Convide novos usuários para {selectedOrganization?.nome}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informações do Convite
            </CardTitle>
            <CardDescription>Preencha os dados para enviar um convite por email</CardDescription>
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
                <p className="text-muted-foreground text-sm">
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
                      <SelectItem key={perfil.id} value={perfil.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{perfil.nome}</span>
                          <span className="text-muted-foreground text-sm">{perfil.descricao}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">
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
                        !dataExpiracao && "text-muted-foreground"
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
                <p className="text-muted-foreground text-sm">
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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-muted-foreground text-sm">
                  Mensagem que será incluída no email de convite
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <NavigationButton href="/convites" variant="outline" className="order-2 sm:order-1">
                  Cancelar
                </NavigationButton>
                <Button type="submit" disabled={loading} className="order-1 flex-1 sm:order-2">
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">📧 Email de Convite</h4>
                <p className="text-muted-foreground text-sm">
                  O usuário receberá um email com link para aceitar o convite
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">⏰ Expiração</h4>
                <p className="text-muted-foreground text-sm">
                  O convite expira na data selecionada e não pode ser usado após
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">✅ Aceitação</h4>
                <p className="text-muted-foreground text-sm">
                  Ao aceitar, o usuário será adicionado automaticamente à organização
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">🔐 Perfil</h4>
                <p className="text-muted-foreground text-sm">
                  O perfil define as permissões e responsabilidades do usuário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
