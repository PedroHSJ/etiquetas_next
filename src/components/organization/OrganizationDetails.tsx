"use client"

import { Building2, MapPin, Phone, Mail, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TIPOS_UAN } from "@/types/uan"
import type { OrganizacaoExpandida } from "@/types/uan"

interface OrganizationDetailsProps {
  organization: OrganizacaoExpandida
  variant?: "card" | "compact" | "inline"
  showAllDetails?: boolean
}

export function OrganizationDetails({ 
  organization, 
  variant = "card",
  showAllDetails = true 
}: OrganizationDetailsProps) {
  
  if (variant === "inline") {
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <Building2 className="h-3 w-3" />
          <span className="font-medium text-sm">{organization.nome}</span>
          {organization.tipo_uan && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {TIPOS_UAN[organization.tipo_uan]}
            </Badge>
          )}
        </div>
        
        {organization.cidade && organization.estado && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{organization.cidade}/{organization.estado}</span>
          </div>
        )}
        
        {organization.telefone_principal && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{organization.telefone_principal}</span>
          </div>
        )}
        
        {organization.capacidade_atendimento && (
          <div className="text-xs text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" />
            {organization.capacidade_atendimento} refeições/dia
          </div>
        )}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="p-3 border rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{organization.nome}</span>
          </div>
          {organization.tipo_uan && (
            <Badge variant="secondary">
              {TIPOS_UAN[organization.tipo_uan]}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {organization.cidade && organization.estado && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{organization.cidade}/{organization.estado}</span>
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
          <div className="text-sm text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" />
            Capacidade: {organization.capacidade_atendimento} refeições/dia
          </div>
        )}
      </div>
    )
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
            <Badge variant="default">
              {TIPOS_UAN[organization.tipo_uan]}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organization.cidade && organization.estado && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Localização</p>
                <p className="text-sm text-muted-foreground">
                  {organization.cidade}/{organization.estado}
                </p>
                {organization.cep && (
                  <p className="text-xs text-muted-foreground">
                    CEP: {organization.cep}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {organization.telefone_principal && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefone Principal</p>
                <p className="text-sm text-muted-foreground">
                  {organization.telefone_principal}
                </p>
                {organization.telefone_secundario && (
                  <p className="text-xs text-muted-foreground">
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
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{organization.email}</p>
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
                  <p className="text-sm text-muted-foreground">{organization.cnpj}</p>
                </div>
              )}
              
              {organization.capacidade_atendimento && (
                <div>
                  <p className="text-sm font-medium">Capacidade de Atendimento</p>
                  <p className="text-sm text-muted-foreground">
                    <Users className="inline h-3 w-3 mr-1" />
                    {organization.capacidade_atendimento} refeições/dia
                  </p>
                </div>
              )}
            </div>

            {/* Horário de funcionamento */}
            {organization.horario_funcionamento && Object.keys(organization.horario_funcionamento).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Horário de Funcionamento</p>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {Object.entries(organization.horario_funcionamento).map(([dia, horario]) => (
                    <div key={dia} className="flex justify-between">
                      <span className="capitalize text-muted-foreground">{dia}:</span>
                      <span>
                        {horario.abertura && horario.fechamento
                          ? `${horario.abertura} - ${horario.fechamento}`
                          : 'Fechado'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responsável técnico */}
            {organization.responsavel_tecnico && (
              <div>
                <p className="text-sm font-medium mb-2">Responsável Técnico</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Nome:</strong> {organization.responsavel_tecnico.nome}</p>
                  {organization.responsavel_tecnico.profissao && (
                    <p><strong>Profissão:</strong> {organization.responsavel_tecnico.profissao}</p>
                  )}
                  {organization.responsavel_tecnico.registro_profissional && (
                    <p><strong>Registro:</strong> {organization.responsavel_tecnico.registro_profissional}</p>
                  )}
                  {organization.responsavel_tecnico.telefone && (
                    <p><strong>Telefone:</strong> {organization.responsavel_tecnico.telefone}</p>
                  )}
                  {organization.responsavel_tecnico.email && (
                    <p><strong>Email:</strong> {organization.responsavel_tecnico.email}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}