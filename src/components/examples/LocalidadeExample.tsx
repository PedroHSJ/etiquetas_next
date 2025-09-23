"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, MapPin, RefreshCw } from 'lucide-react'
import { LocalidadeSelector } from '@/components/localidade'
import { useLocalidade } from '@/hooks/useLocalidade'

export function LocalidadeExample() {
  const {
    buscarCEP,
    buscarOuCriarMunicipioPorCEP,
    validarCEP,
    formatarCEP,
    loading
  } = useLocalidade()

  const [cepTeste, setCepTeste] = useState('')
  const [resultadoCEP, setResultadoCEP] = useState<any>(null)
  const [localidadeSelecionada, setLocalidadeSelecionada] = useState({})

  const testarCEP = async () => {
    if (!validarCEP(cepTeste)) {
      return
    }

    const resultado = await buscarOuCriarMunicipioPorCEP(cepTeste)
    setResultadoCEP(resultado)
  }

  const testarBuscaCEP = async () => {
    if (!validarCEP(cepTeste)) {
      return
    }

    const dadosCEP = await buscarCEP(cepTeste)
    setResultadoCEP({ dadosCEP })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Teste de Localidade</h1>
        <p className="text-muted-foreground">
          Sistema de integração com ViaCEP e gestão de localidades
        </p>
      </div>

      {/* Teste de CEP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Teste de Busca por CEP
          </CardTitle>
          <CardDescription>
            Digite um CEP para testar a integração com ViaCEP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cep-teste">CEP</Label>
              <Input
                id="cep-teste"
                placeholder="00000-000"
                value={cepTeste}
                onChange={(e) => setCepTeste(formatarCEP(e.target.value))}
                maxLength={9}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={testarBuscaCEP}
                disabled={loading || !validarCEP(cepTeste)}
                variant="outline"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar
              </Button>
              <Button 
                onClick={testarCEP}
                disabled={loading || !validarCEP(cepTeste)}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Criar Município
              </Button>
            </div>
          </div>

          {resultadoCEP && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Resultado:</h4>
              
              {resultadoCEP.dadosCEP && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">CEP</Badge>
                    <span>{resultadoCEP.dadosCEP.cep}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Endereço</Badge>
                    <span>{resultadoCEP.dadosCEP.logradouro}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Bairro</Badge>
                    <span>{resultadoCEP.dadosCEP.bairro}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Cidade</Badge>
                    <span>{resultadoCEP.dadosCEP.localidade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">UF</Badge>
                    <span>{resultadoCEP.dadosCEP.uf}</span>
                  </div>
                  {resultadoCEP.dadosCEP.ibge && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">IBGE</Badge>
                      <span>{resultadoCEP.dadosCEP.ibge}</span>
                    </div>
                  )}
                </div>
              )}

              {resultadoCEP.municipio && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2">Município no Banco:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>ID</Badge>
                      <span>{resultadoCEP.municipio.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Nome</Badge>
                      <span>{resultadoCEP.municipio.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Estado</Badge>
                      <span>{resultadoCEP.municipio.estado.nome} ({resultadoCEP.municipio.estado.codigo})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Seletor de Localidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seletor de Localidade Completo
          </CardTitle>
          <CardDescription>
            Componente integrado para seleção de localidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocalidadeSelector
            value={localidadeSelecionada}
            onChange={setLocalidadeSelecionada}
            showAddressFields={true}
          />

          {Object.keys(localidadeSelecionada).length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Dados Selecionados:</h4>
              <pre className="text-sm bg-background p-2 rounded border overflow-auto">
                {JSON.stringify(localidadeSelecionada, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}