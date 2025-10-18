"use client";

import { Building2, MapPin, Phone, Mail, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TIPOS_UAN } from "@/types/uan";
import type { OrganizacaoExpandida } from "@/types/uan";

interface OrganizationDetailsProps {
  organization: OrganizacaoExpandida;
  variant?: "card" | "compact" | "inline";
  showAllDetails?: boolean;
}

export function OrganizationDetails({
  organization,
  variant = "card",
  showAllDetails = true,
}: OrganizationDetailsProps) {
  if (variant === "inline") {
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <Building2 className="h-3 w-3" />
          <span className="text-sm font-medium">{organization.nome}</span>
          {organization.tipo_uan && (
            <Badge variant="secondary" className="px-1 py-0 text-xs">
              {TIPOS_UAN[organization.tipo_uan]}
            </Badge>
          )}
        </div>

        {organization.cidade && organization.estado && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3" />
            <span>
              {organization.cidade}/{organization.estado}
            </span>
          </div>
        )}

        {organization.telefone_principal && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Phone className="h-3 w-3" />
            <span>{organization.telefone_principal}</span>
          </div>
        )}

        {organization.capacidade_atendimento && (
          <div className="text-muted-foreground text-xs">
            <Users className="mr-1 inline h-3 w-3" />
            {organization.capacidade_atendimento} refeições/dia
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{organization.nome}</span>
          </div>
          {organization.tipo_uan && (
            <Badge variant="secondary">{TIPOS_UAN[organization.tipo_uan]}</Badge>
          )}
        </div>

        <div className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
          {organization.cidade && organization.estado && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>
                {organization.cidade}/{organization.estado}
              </span>
            </div>
          )}

          {organization.telefone_principal && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{organization.telefone_principal}</span>
            </div>
          )}
        </div>

        {organization.capacidade_atendimento && (
          <div className="text-muted-foreground text-sm">
            <Users className="mr-1 inline h-3 w-3" />
            Capacidade: {organization.capacidade_atendimento} refeições/dia
          </div>
        )}
      </div>
    );
  }

  // Variant "card" - Full details
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organization.nome}
          </div>
          {organization.tipo_uan && (
            <Badge variant="default">{TIPOS_UAN[organization.tipo_uan]}</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {organization.cidade && organization.estado && (
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Localização</p>
                <p className="text-muted-foreground text-sm">
                  {organization.cidade}/{organization.estado}
                </p>
                {organization.cep && (
                  <p className="text-muted-foreground text-xs">CEP: {organization.cep}</p>
                )}
              </div>
            </div>
          )}

          {organization.telefone_principal && (
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Telefone Principal</p>
                <p className="text-muted-foreground text-sm">{organization.telefone_principal}</p>
                {organization.telefone_secundario && (
                  <p className="text-muted-foreground text-xs">
                    Secundário: {organization.telefone_secundario}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        {organization.email && (
          <div className="flex items-center gap-2">
            <Mail className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-muted-foreground text-sm">{organization.email}</p>
            </div>
          </div>
        )}

        {showAllDetails && (
          <>
            <Separator />

            {/* Informações UAN específicas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {organization.cnpj && (
                <div>
                  <p className="text-sm font-medium">CNPJ</p>
                  <p className="text-muted-foreground text-sm">{organization.cnpj}</p>
                </div>
              )}

              {organization.capacidade_atendimento && (
                <div>
                  <p className="text-sm font-medium">Capacidade de Atendimento</p>
                  <p className="text-muted-foreground text-sm">
                    <Users className="mr-1 inline h-3 w-3" />
                    {organization.capacidade_atendimento} refeições/dia
                  </p>
                </div>
              )}
            </div>

            {/* Horário de funcionamento */}
            {organization.horario_funcionamento &&
              Object.keys(organization.horario_funcionamento).length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <p className="text-sm font-medium">Horário de Funcionamento</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {Object.entries(organization.horario_funcionamento).map(([dia, horario]) => (
                      <div key={dia} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{dia}:</span>
                        <span>
                          {horario.abertura && horario.fechamento
                            ? `${horario.abertura} - ${horario.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Responsável técnico */}
            {organization.responsavel_tecnico && (
              <div>
                <p className="mb-2 text-sm font-medium">Responsável Técnico</p>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>
                    <strong>Nome:</strong> {organization.responsavel_tecnico.nome}
                  </p>
                  {organization.responsavel_tecnico.profissao && (
                    <p>
                      <strong>Profissão:</strong> {organization.responsavel_tecnico.profissao}
                    </p>
                  )}
                  {organization.responsavel_tecnico.registro_profissional && (
                    <p>
                      <strong>Registro:</strong>{" "}
                      {organization.responsavel_tecnico.registro_profissional}
                    </p>
                  )}
                  {organization.responsavel_tecnico.telefone && (
                    <p>
                      <strong>Telefone:</strong> {organization.responsavel_tecnico.telefone}
                    </p>
                  )}
                  {organization.responsavel_tecnico.email && (
                    <p>
                      <strong>Email:</strong> {organization.responsavel_tecnico.email}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
