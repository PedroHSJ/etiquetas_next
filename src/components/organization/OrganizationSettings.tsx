"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Phone,
  // Mail,
  // Users,
  Save,
  Loader2,
} from "lucide-react";
import type { Organization } from "@/types/models/organization";
import { OrganizationType } from "@/types/enums/organization";
import type { UpdateOrganizationDto } from "@/types/dto/organization";
import { OrganizationService } from "@/lib/services/client/organization-service";
import { useToast } from "@/hooks/use-toast";
import { LocationSelector } from "@/components/location/LocationSelector";

// Organization types mapping
const ORGANIZATION_TYPES = {
  [OrganizationType.COMMERCIAL]: "Restaurante Comercial",
  [OrganizationType.INSTITUTIONAL]: "Restaurante Institucional",
  [OrganizationType.HOSPITAL]: "Hospital",
  [OrganizationType.SCHOOL]: "Escola",
  [OrganizationType.COMPANY]: "Empresa",
  [OrganizationType.OTHER]: "Outro",
} as const;

// Form validation schema
const organizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  type: z.nativeEnum(OrganizationType).optional(),
  cnpj: z.string().optional(),
  // Location fields
  stateId: z.number().optional(),
  cityId: z.number().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  addressComplement: z.string().optional(),
  district: z.string().optional(),
  // Contact fields
  mainPhone: z.string().optional(),
  altPhone: z.string().optional(),
  institutionalEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  // Capacity
  capacity: z.number().min(1).optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationSettingsProps {
  organization: Organization;
  onUpdate?: (updatedOrganization: Organization) => void;
  readOnly?: boolean;
}

export function OrganizationSettings({
  organization,
  onUpdate,
  readOnly = false,
}: OrganizationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Prepare initial form data from Organization model
  const defaultValues: OrganizationFormData = {
    name: organization.name || "",
    type: organization.type || undefined,
    cnpj: organization.cnpj || "",
    // Location fields
    stateId: organization.stateId || undefined,
    cityId: organization.cityId || undefined,
    zipCode: organization.zipCode || "",
    address: organization.address || "",
    number: organization.number || "",
    addressComplement: organization.addressComplement || "",
    district: organization.district || "",
    // Contact fields
    mainPhone: organization.mainPhone || "",
    altPhone: organization.altPhone || "",
    institutionalEmail: organization.institutionalEmail || "",
    // Capacity
    capacity: organization.capacity || undefined,
  };

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
  });

  const onSubmit = async (data: OrganizationFormData) => {
    if (readOnly) return;

    setIsLoading(true);

    try {
      // Prepare DTO for update
      const updateData: UpdateOrganizationDto = {
        name: data.name,
        type: data.type,
        cnpj: data.cnpj || undefined,
        // Location
        stateId: data.stateId,
        cityId: data.cityId,
        zipCode: data.zipCode,
        address: data.address,
        number: data.number,
        addressComplement: data.addressComplement,
        district: data.district,
        // Contact
        mainPhone: data.mainPhone,
        altPhone: data.altPhone,
        institutionalEmail: data.institutionalEmail,
        // Capacity
        capacity: data.capacity,
      };

      const updatedOrg = await OrganizationService.updateOrganizationExpanded(
        organization.id,
        updateData
      );

      toast.success("As informações foram salvas com sucesso.");

      onUpdate?.(updatedOrg);
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
      toast.error("Não foi possível atualizar as informações da organização.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>Dados principais da organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de UAN</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ORGANIZATION_TYPES).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="00.000.000/0000-00"
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade de Atendimento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value ? parseInt(value, 10) : undefined
                          );
                        }}
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

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
            <CardDescription>Endereço completo da organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationSelector
              value={{
                estado_id: form.watch("stateId"),
                municipio_id: form.watch("cityId"),
                cep: form.watch("zipCode"),
                endereco: form.watch("address"),
                numero: form.watch("number"),
                complemento: form.watch("addressComplement"),
                bairro: form.watch("district"),
              }}
              onChange={(localidade) => {
                if (localidade.estado_id !== undefined)
                  form.setValue("stateId", localidade.estado_id);
                if (localidade.municipio_id !== undefined)
                  form.setValue("cityId", localidade.municipio_id);
                if (localidade.cep !== undefined)
                  form.setValue("zipCode", localidade.cep);
                if (localidade.endereco !== undefined)
                  form.setValue("address", localidade.endereco);
                if (localidade.numero !== undefined)
                  form.setValue("number", localidade.numero);
                if (localidade.complemento !== undefined)
                  form.setValue("addressComplement", localidade.complemento);
                if (localidade.bairro !== undefined)
                  form.setValue("district", localidade.bairro);
              }}
              disabled={readOnly}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
            <CardDescription>Informações de contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mainPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Principal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(00) 0000-0000"
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="altPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Secundário</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(00) 0000-0000"
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
              name="institutionalEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Institucional</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="contato@organizacao.com.br"
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {!readOnly && (
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
