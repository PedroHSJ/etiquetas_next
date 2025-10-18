"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Clock, Users, Save, Loader2 } from "lucide-react";
import { TIPOS_UAN } from "@/types/uan";
import type { OrganizacaoExpandida, HorarioFuncionamento } from "@/types/uan";
import { UANService } from "@/lib/services/UANService";
import { useToast } from "@/hooks/use-toast";
import { LocalidadeSelector } from "@/components/localidade/LocalidadeSelector";

// Schema de validação
const organizationSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  tipo_uan: z
    .enum([
      "restaurante_comercial",
      "restaurante_institucional",
      "lanchonete",
      "padaria",
      "cozinha_industrial",
      "catering",
      "outro",
    ])
    .optional(),
  cnpj: z.string().optional(),
  // Novos campos de localidade
  estado_id: z.number().optional(),
  municipio_id: z.number().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  // Campos antigos mantidos para compatibilidade
  endereco_completo: z.string().optional(),
  cidade: z.string().optional(),
  telefone_principal: z.string().optional(),
  telefone_secundario: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  capacidade_atendimento: z.number().min(1).optional(),
  // Responsável técnico
  responsavel_nome: z.string().optional(),
  responsavel_profissao: z.string().optional(),
  responsavel_registro: z.string().optional(),
  responsavel_telefone: z.string().optional(),
  responsavel_email: z.string().email("Email inválido").optional().or(z.literal("")),
  // Horários (simplificado para o formulário)
  segunda_abertura: z.string().optional(),
  segunda_fechamento: z.string().optional(),
  terca_abertura: z.string().optional(),
  terca_fechamento: z.string().optional(),
  quarta_abertura: z.string().optional(),
  quarta_fechamento: z.string().optional(),
  quinta_abertura: z.string().optional(),
  quinta_fechamento: z.string().optional(),
  sexta_abertura: z.string().optional(),
  sexta_fechamento: z.string().optional(),
  sabado_abertura: z.string().optional(),
  sabado_fechamento: z.string().optional(),
  domingo_abertura: z.string().optional(),
  domingo_fechamento: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationSettingsProps {
  organization: OrganizacaoExpandida;
  onUpdate?: (updatedOrganization: OrganizacaoExpandida) => void;
  readOnly?: boolean;
}

export function OrganizationSettings({
  organization,
  onUpdate,
  readOnly = false,
}: OrganizationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Preparar dados iniciais do formulário
  const defaultValues: OrganizationFormData = {
    nome: organization.nome || "",
    descricao: organization.descricao || "",
    tipo_uan: organization.tipo_uan || undefined,
    cnpj: organization.cnpj || "",
    // Novos campos de localidade
    estado_id: organization.estado_id || undefined,
    municipio_id: organization.municipio_id || undefined,
    cep: organization.cep || "",
    endereco: organization.endereco || "",
    numero: organization.numero || "",
    complemento: organization.complemento || "",
    bairro: organization.bairro || "",
    // Campos antigos para compatibilidade
    endereco_completo: organization.endereco_completo || "",
    cidade: organization.cidade || "",
    telefone_principal: organization.telefone_principal || "",
    telefone_secundario: organization.telefone_secundario || "",
    email: organization.email || "",
    capacidade_atendimento: organization.capacidade_atendimento || undefined,
    // Responsável técnico
    responsavel_nome: organization.responsavel_tecnico?.nome || "",
    responsavel_profissao: organization.responsavel_tecnico?.profissao || "",
    responsavel_registro: organization.responsavel_tecnico?.registro_profissional || "",
    responsavel_telefone: organization.responsavel_tecnico?.telefone || "",
    responsavel_email: organization.responsavel_tecnico?.email || "",
    // Horários
    segunda_abertura: organization.horario_funcionamento?.segunda?.abertura || "",
    segunda_fechamento: organization.horario_funcionamento?.segunda?.fechamento || "",
    terca_abertura: organization.horario_funcionamento?.terca?.abertura || "",
    terca_fechamento: organization.horario_funcionamento?.terca?.fechamento || "",
    quarta_abertura: organization.horario_funcionamento?.quarta?.abertura || "",
    quarta_fechamento: organization.horario_funcionamento?.quarta?.fechamento || "",
    quinta_abertura: organization.horario_funcionamento?.quinta?.abertura || "",
    quinta_fechamento: organization.horario_funcionamento?.quinta?.fechamento || "",
    sexta_abertura: organization.horario_funcionamento?.sexta?.abertura || "",
    sexta_fechamento: organization.horario_funcionamento?.sexta?.fechamento || "",
    sabado_abertura: organization.horario_funcionamento?.sabado?.abertura || "",
    sabado_fechamento: organization.horario_funcionamento?.sabado?.fechamento || "",
    domingo_abertura: organization.horario_funcionamento?.domingo?.abertura || "",
    domingo_fechamento: organization.horario_funcionamento?.domingo?.fechamento || "",
  };

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
  });

  const onSubmit = async (data: OrganizationFormData) => {
    if (readOnly) return;

    setIsLoading(true);

    try {
      // Construir objeto de horário de funcionamento
      const horario_funcionamento: HorarioFuncionamento = {
        segunda:
          data.segunda_abertura && data.segunda_fechamento
            ? { abertura: data.segunda_abertura, fechamento: data.segunda_fechamento }
            : { abertura: null, fechamento: null },
        terca:
          data.terca_abertura && data.terca_fechamento
            ? { abertura: data.terca_abertura, fechamento: data.terca_fechamento }
            : { abertura: null, fechamento: null },
        quarta:
          data.quarta_abertura && data.quarta_fechamento
            ? { abertura: data.quarta_abertura, fechamento: data.quarta_fechamento }
            : { abertura: null, fechamento: null },
        quinta:
          data.quinta_abertura && data.quinta_fechamento
            ? { abertura: data.quinta_abertura, fechamento: data.quinta_fechamento }
            : { abertura: null, fechamento: null },
        sexta:
          data.sexta_abertura && data.sexta_fechamento
            ? { abertura: data.sexta_abertura, fechamento: data.sexta_fechamento }
            : { abertura: null, fechamento: null },
        sabado:
          data.sabado_abertura && data.sabado_fechamento
            ? { abertura: data.sabado_abertura, fechamento: data.sabado_fechamento }
            : { abertura: null, fechamento: null },
        domingo:
          data.domingo_abertura && data.domingo_fechamento
            ? { abertura: data.domingo_abertura, fechamento: data.domingo_fechamento }
            : { abertura: null, fechamento: null },
      };

      // Construir objeto do responsável técnico
      const responsavel_tecnico =
        data.responsavel_nome ||
        data.responsavel_profissao ||
        data.responsavel_registro ||
        data.responsavel_telefone ||
        data.responsavel_email
          ? {
              nome: data.responsavel_nome || "",
              profissao: data.responsavel_profissao || null,
              registro_profissional: data.responsavel_registro || null,
              telefone: data.responsavel_telefone || null,
              email: data.responsavel_email || null,
            }
          : null;

      const updateData = {
        nome: data.nome,
        descricao: data.descricao || undefined,
        tipo_uan: data.tipo_uan || undefined,
        cnpj: data.cnpj || undefined,
        // Novos campos de localização
        estado_id: data.estado_id || undefined,
        municipio_id: data.municipio_id || undefined,
        cep: data.cep || undefined,
        endereco: data.endereco || undefined,
        numero: data.numero || undefined,
        complemento: data.complemento || undefined,
        bairro: data.bairro || undefined,
        // Campos antigos para compatibilidade
        endereco_completo: data.endereco_completo || undefined,
        cidade: data.cidade || undefined,
        telefone_principal: data.telefone_principal || undefined,
        telefone_secundario: data.telefone_secundario || undefined,
        email: data.email || undefined,
        capacidade_atendimento: data.capacidade_atendimento || undefined,
        responsavel_tecnico,
        horario_funcionamento,
      };

      const updatedOrg = await UANService.updateOrganizacao(organization.id, updateData);

      toast("Organização atualizada", {
        description: "As informações foram salvas com sucesso.",
      });

      onUpdate?.(updatedOrg);
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
      toast("Erro ao salvar", {
        description: "Não foi possível atualizar as informações da organização.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>Dados principais da organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Organização *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_uan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de UAN</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={readOnly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TIPOS_UAN).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva a organização..."
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="00.000.000/0000-00" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacidade_atendimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade de Atendimento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="Número de refeições/dia"
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormDescription>Número de refeições servidas por dia</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contato e Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contato e Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="telefone_principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Principal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-9999" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone_secundario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Secundário</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-9999" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="contato@organizacao.com"
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Rua, número, complemento, bairro..."
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <FormLabel>Localização</FormLabel>
                <FormDescription>
                  Digite o CEP para busca automática ou selecione manualmente
                </FormDescription>
                <div className="mt-2">
                  <LocalidadeSelector
                    value={{
                      estado_id: form.watch("estado_id"),
                      municipio_id: form.watch("municipio_id"),
                      cep: form.watch("cep"),
                      endereco: form.watch("endereco"),
                      numero: form.watch("numero"),
                      complemento: form.watch("complemento"),
                      bairro: form.watch("bairro"),
                    }}
                    onChange={(localidade) => {
                      if (localidade.estado_id !== undefined) {
                        form.setValue("estado_id", localidade.estado_id);
                      }
                      if (localidade.municipio_id !== undefined) {
                        form.setValue("municipio_id", localidade.municipio_id);
                      }
                      if (localidade.cep !== undefined) {
                        form.setValue("cep", localidade.cep);
                      }
                      if (localidade.endereco !== undefined) {
                        form.setValue("endereco", localidade.endereco);
                      }
                      if (localidade.numero !== undefined) {
                        form.setValue("numero", localidade.numero);
                      }
                      if (localidade.complemento !== undefined) {
                        form.setValue("complemento", localidade.complemento);
                      }
                      if (localidade.bairro !== undefined) {
                        form.setValue("bairro", localidade.bairro);
                      }
                    }}
                    disabled={readOnly}
                    showAddressFields={true}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsável Técnico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Responsável Técnico
            </CardTitle>
            <CardDescription>Informações do responsável técnico da UAN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="responsavel_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel_profissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Nutricionista" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="responsavel_registro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registro Profissional</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: CRN 12345" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel_telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-9999" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@exemplo.com"
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Defina os horários de abertura e fechamento para cada dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "segunda", label: "Segunda-feira" },
              { key: "terca", label: "Terça-feira" },
              { key: "quarta", label: "Quarta-feira" },
              { key: "quinta", label: "Quinta-feira" },
              { key: "sexta", label: "Sexta-feira" },
              { key: "sabado", label: "Sábado" },
              { key: "domingo", label: "Domingo" },
            ].map(({ key, label }) => (
              <div key={key} className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
                <Label className="font-medium">{label}</Label>
                <FormField
                  control={form.control}
                  name={`${key}_abertura` as keyof OrganizationFormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="time" disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${key}_fechamento` as keyof OrganizationFormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="time" disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
