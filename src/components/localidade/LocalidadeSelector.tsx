import React, { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationService } from "@/lib/services/client/localidade-service";
import {
  City,
  CityWithState,
  State as StateModel,
} from "@/types/models/location";
import { ViaCepResponseDto } from "@/types/dto/location/response";
import { useToast } from "@/hooks/use-toast";
import { formatCEP, unformatCEP } from "@/utils/masks";

interface LocalidadeSelectorProps {
  value?: {
    estado_id?: number;
    municipio_id?: number;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
  };
  onChange: (localidade: {
    estado_id?: number;
    municipio_id?: number;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
  }) => void;
  showAddressFields?: boolean;
  disabled?: boolean;
}

export function LocalidadeSelector({
  value = {},
  onChange,
  showAddressFields = true,
  disabled = false,
}: LocalidadeSelectorProps) {
  const { toast } = useToast();

  // Estados e municípios
  const [estados, setEstados] = useState<StateModel[]>([]);
  const [municipios, setMunicipios] = useState<City[]>([]);
  const [municipioSelecionado, setMunicipioSelecionado] =
    useState<CityWithState | null>(null);

  // Loading states
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Form values
  const [cep, setCep] = useState(value.cep || "");
  const [endereco, setEndereco] = useState(value.endereco || "");
  const [numero, setNumero] = useState(value.numero || "");
  const [complemento, setComplemento] = useState(value.complemento || "");
  const [bairro, setBairro] = useState(value.bairro || "");

  // Carrega estados ao montar o componente
  useEffect(() => {
    carregarEstados();
  }, []);

  // Carrega municípios quando o estado muda
  useEffect(() => {
    if (value.estado_id) {
      carregarMunicipios(value.estado_id);
    } else {
      setMunicipios([]);
      setMunicipioSelecionado(null);
    }
  }, [value.estado_id]);

  // Atualiza o município selecionado quando o value muda
  useEffect(() => {
    if (value.municipio_id && municipios.length > 0) {
      const municipio = municipios.find((m) => m.id === value.municipio_id);
      setMunicipioSelecionado(municipio || null);
    } else {
      setMunicipioSelecionado(null);
    }
  }, [value.municipio_id, municipios]);

  // Sincroniza os campos locais com o value
  useEffect(() => {
    setCep(value.cep || "");
    setEndereco(value.endereco || "");
    setNumero(value.numero || "");
    setComplemento(value.complemento || "");
    setBairro(value.bairro || "");
  }, [value]);

  const carregarEstados = async () => {
    try {
      console.log("🔍 LocalidadeSelector: Carregando estados...");
      setLoadingEstados(true);
      const estadosData = await LocationService.listStates();
      console.log("✅ LocalidadeSelector: Estados carregados:", estadosData);
      setEstados(estadosData);
    } catch (error) {
      console.error("❌ LocalidadeSelector: Erro ao carregar estados:", error);
      toast.error("Erro ao carregar estados");
    } finally {
      setLoadingEstados(false);
    }
  };

  const carregarMunicipios = async (estadoId: number) => {
    try {
      setLoadingMunicipios(true);
      const municipiosData = await LocationService.listCitiesByState(estadoId);
      setMunicipios(municipiosData);
    } catch (error) {
      toast.error("Erro ao carregar municípios");
    } finally {
      setLoadingMunicipios(false);
    }
  };

  const buscarPorCEP = useCallback(async () => {
    if (!LocationService.validateCEP(cep)) {
      toast.error("CEP inválido - Digite um CEP válido com 8 dígitos");
      return;
    }

    try {
      setLoadingCEP(true);

      const municipioResponse = await LocationService.fetchOrCreateCity(cep);

      if (!municipioResponse) {
        toast.error("CEP não encontrado - Verifique se o CEP está correto");
        return;
      }

      if (!municipioResponse.state) {
        toast.error("Estado não encontrado para este CEP");
        return;
      }

      // Busca dados completos do CEP
      const dadosCEP = await LocationService.fetchCEP(cep);

      if (dadosCEP) {
        // Atualiza os campos de endereço
        setEndereco(dadosCEP.logradouro);
        setBairro(dadosCEP.bairro);

        // Atualiza a seleção
        onChange({
          ...value,
          estado_id: municipioResponse.state.id,
          municipio_id: municipioResponse.id,
          cep: cep, // Já está sem formatação
          endereco: dadosCEP.logradouro,
          numero,
          complemento,
          bairro: dadosCEP.bairro,
        });

        toast.success(
          `CEP encontrado! ${municipioResponse.name} - ${municipioResponse.state.code}`
        );
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCEP(false);
    }
  }, [cep, numero, complemento, onChange, value, toast]);

  const handleEstadoChange = (estadoId: string) => {
    const novoEstadoId = parseInt(estadoId);
    onChange({
      ...value,
      estado_id: novoEstadoId,
      municipio_id: undefined, // Reset município quando estado muda
    });
    setMunicipioSelecionado(null);
    carregarMunicipios(novoEstadoId);
  };

  const handleMunicipioChange = (municipio: Municipio) => {
    setMunicipioSelecionado(municipio);
    onChange({
      ...value,
      municipio_id: municipio.id,
    });
  };

  const handleCepChange = (novoCep: string) => {
    setCep(novoCep);

    onChange({
      ...value,
      cep: novoCep,
    });
  };

  const filteredMunicipios = municipios;

  return (
    <div className="space-y-4">
      {/* CEP e busca */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="cep" className="mb-2">
            CEP
          </Label>
          <Input
            id="cep"
            placeholder="00000-000"
            value={formatCEP(cep)}
            onChange={(e) => handleCepChange(unformatCEP(e.target.value))}
            disabled={disabled}
            maxLength={9}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={buscarPorCEP}
            disabled={disabled || loadingCEP || !cep}
          >
            {loadingCEP ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Estado e Município */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Estado</Label>
          <Select
            value={value.estado_id?.toString()}
            onValueChange={handleEstadoChange}
            disabled={true}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado.id} value={estado.id.toString()}>
                  {estado.nome} ({estado.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2">Município</Label>
          <Select
            value={value.municipio_id?.toString()}
            onValueChange={(value) => {
              const municipio = municipios.find(
                (m) => m.id.toString() === value
              );
              if (municipio) handleMunicipioChange(municipio);
            }}
            disabled={true}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o município" />
            </SelectTrigger>
            <SelectContent>
              {loadingMunicipios ? (
                <SelectItem value="loading" disabled>
                  Carregando...
                </SelectItem>
              ) : filteredMunicipios.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Nenhum município encontrado
                </SelectItem>
              ) : (
                filteredMunicipios.map((municipio) => (
                  <SelectItem
                    key={municipio.id}
                    value={municipio.id.toString()}
                  >
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {municipio.nome}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campos de endereço */}
      {showAddressFields && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="endereco" className="mb-2">
              Endereço
            </Label>
            <Input
              id="endereco"
              placeholder="Rua, Avenida, etc."
              value={endereco}
              onChange={(e) => {
                setEndereco(e.target.value);
                onChange({ ...value, endereco: e.target.value });
              }}
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numero" className="mb-2">
                Número
              </Label>
              <Input
                id="numero"
                placeholder="123"
                value={numero}
                onChange={(e) => {
                  setNumero(e.target.value);
                  onChange({ ...value, numero: e.target.value });
                }}
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="complemento" className="mb-2">
                Complemento
              </Label>
              <Input
                id="complemento"
                placeholder="Apto, Sala, etc."
                value={complemento}
                onChange={(e) => {
                  setComplemento(e.target.value);
                  onChange({ ...value, complemento: e.target.value });
                }}
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="bairro" className="mb-2">
                Bairro
              </Label>
              <Input
                id="bairro"
                placeholder="Centro, etc."
                value={bairro}
                onChange={(e) => {
                  setBairro(e.target.value);
                  onChange({ ...value, bairro: e.target.value });
                }}
                disabled={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
