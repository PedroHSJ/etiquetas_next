"use client";

import { Building2, MapPin, Phone, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import { TIPOS_UAN } from "@/types/uan";
import { Organization } from "@/types/models/organization";

interface OrganizationDetailsProps {
  organization: Organization;
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
          <span className="font-medium text-sm">{organization.name}</span>
          {organization.type && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {organization.type}
            </Badge>
          )}
        </div>

        {organization.city && organization.state && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>
              {organization.city.name}/{organization.state.name}
            </span>
          </div>
        )}

        {organization.mainPhone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{organization.mainPhone}</span>
          </div>
        )}

        {organization.capacity && (
          <div className="text-xs text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" />
            {organization.capacity} refeições/dia
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="p-3 border rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{organization.name}</span>
          </div>
          {organization.type && (
            <Badge variant="secondary">{organization.type}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {organization.city && organization.state && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>
                {organization.city.name}/{organization.state.name}
              </span>
            </div>
          )}

          {organization.mainPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{organization.mainPhone}</span>
            </div>
          )}
        </div>

        {organization.capacity && (
          <div className="text-sm text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" />
            Capacidade: {organization.capacity} refeições/dia
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
            {organization.name}
          </div>
          {organization.type && (
            <Badge variant="default">{organization.type}</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organization.city && organization.state && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Localização</p>
                <p className="text-sm text-muted-foreground">
                  {organization.city.name}/{organization.state.name}
                </p>
                {organization.zipCode && (
                  <p className="text-xs text-muted-foreground">
                    CEP: {organization.zipCode}
                  </p>
                )}
              </div>
            </div>
          )}

          {organization.mainPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefone Principal</p>
                <p className="text-sm text-muted-foreground">
                  {organization.mainPhone}
                </p>
                {organization.altPhone && (
                  <p className="text-xs text-muted-foreground">
                    Secundário: {organization.altPhone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        {organization.institutionalEmail && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {organization.institutionalEmail}
              </p>
            </div>
          </div>
        )}

        {showAllDetails && (
          <>
            <Separator />

            {/* Informações UAN específicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.cnpj && (
                <div>
                  <p className="text-sm font-medium">CNPJ</p>
                  <p className="text-sm text-muted-foreground">
                    {organization.cnpj}
                  </p>
                </div>
              )}

              {organization.capacity && (
                <div>
                  <p className="text-sm font-medium">
                    Capacidade de Atendimento
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Users className="inline h-3 w-3 mr-1" />
                    {organization.capacity} refeições/dia
                  </p>
                </div>
              )}
            </div>

            {/* Horário de funcionamento */}
            {/* {organization.horario_funcionamento &&
              Object.keys(organization.horario_funcionamento).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Horário de Funcionamento
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {Object.entries(organization.horario_funcionamento).map(
                      ([dia, horario]) => (
                        <div key={dia} className="flex justify-between">
                          <span className="capitalize text-muted-foreground">
                            {dia}:
                          </span>
                          <span>
                            {horario.abertura && horario.fechamento
                              ? `${horario.abertura} - ${horario.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )} */}

            {/* Responsável técnico */}
            {organization.technicalResponsible && (
              <div>
                <p className="text-sm font-medium mb-2">Responsável Técnico</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Nome:</strong>{" "}
                    {organization.technicalResponsible.name}
                  </p>
                  {organization.technicalResponsible.formattedDocument && (
                    <p>
                      <strong>Documento:</strong>{" "}
                      {organization.technicalResponsible.formattedDocument}
                    </p>
                  )}
                  {organization.technicalResponsible.phone && (
                    <p>
                      <strong>Telefone:</strong>{" "}
                      {organization.technicalResponsible.phone}
                    </p>
                  )}
                  {organization.technicalResponsible.email && (
                    <p>
                      <strong>Email:</strong>{" "}
                      {organization.technicalResponsible.email}
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
