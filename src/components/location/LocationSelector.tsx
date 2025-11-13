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
import { Estado, Municipio } from "@/types/localidade";
import { useToast } from "@/hooks/use-toast";
import { formatCEP, unformatCEP } from "@/utils/masks";

interface LocationSelectorProps {
  value?: {
    estado_id?: number;
    municipio_id?: number;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
  };
  onChange: (location: {
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

export function LocationSelector({
  value = {},
  onChange,
  showAddressFields = true,
  disabled = false,
}: LocationSelectorProps) {
  const { toast } = useToast();

  // States and cities
  const [states, setStates] = useState<Estado[]>([]);
  const [cities, setCities] = useState<Municipio[]>([]);
  const [selectedCity, setSelectedCity] = useState<Municipio | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZipCode, setLoadingZipCode] = useState(false);

  // Form values
  const [zipCode, setZipCode] = useState(value.cep || "");
  const [address, setAddress] = useState(value.endereco || "");
  const [number, setNumber] = useState(value.numero || "");
  const [complement, setComplement] = useState(value.complemento || "");
  const [district, setDistrict] = useState(value.bairro || "");

  // Load states when component mounts
  useEffect(() => {
    loadStates();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (value.estado_id) {
      loadCities(value.estado_id);
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [value.estado_id]);

  // Update selected city when value changes
  useEffect(() => {
    if (value.municipio_id && cities.length > 0) {
      const city = cities.find((c) => c.id === value.municipio_id);
      setSelectedCity(city || null);
    } else {
      setSelectedCity(null);
    }
  }, [value.municipio_id, cities]);

  // Sync local fields with value
  useEffect(() => {
    setZipCode(value.cep || "");
    setAddress(value.endereco || "");
    setNumber(value.numero || "");
    setComplement(value.complemento || "");
    setDistrict(value.bairro || "");
  }, [value]);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const statesData = await LocationService.listStates();
      setStates(statesData);
    } catch (error) {
      toast.error("Error loading states");
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateId: number) => {
    try {
      setLoadingCities(true);
      const citiesData = await LocationService.listCitiesByState(stateId);
      setCities(citiesData);
    } catch (error) {
      toast.error("Error loading cities");
    } finally {
      setLoadingCities(false);
    }
  };

  const searchByZipCode = useCallback(async () => {
    if (!LocationService.validateCEP(zipCode)) {
      toast.error("Invalid ZIP code - Enter a valid 8-digit ZIP code");
      return;
    }

    try {
      setLoadingZipCode(true);

      const cityResponse = await LocationService.fetchOrCreateCity(zipCode);

      if (!cityResponse) {
        toast.error("ZIP code not found - Verify if the ZIP code is correct");
        return;
      }

      // Fetch complete ZIP code data
      const zipCodeData = await LocationService.fetchCEP(zipCode);

      if (zipCodeData) {
        // Update address fields
        setAddress(zipCodeData.logradouro);
        setDistrict(zipCodeData.bairro);

        // Update selection
        onChange({
          ...value,
          estado_id: cityResponse.estado.id,
          municipio_id: cityResponse.id,
          cep: zipCode, // Already unformatted
          endereco: zipCodeData.logradouro,
          numero: number,
          complemento: complement,
          bairro: zipCodeData.bairro,
        });

        toast.success(
          `ZIP code found! ${cityResponse.nome} - ${cityResponse.estado.codigo}`
        );
      }
    } catch (error) {
      toast.error("Error searching ZIP code");
    } finally {
      setLoadingZipCode(false);
    }
  }, [zipCode, number, complement, onChange, value, toast]);

  const handleStateChange = (stateId: string) => {
    const newStateId = parseInt(stateId);
    onChange({
      ...value,
      estado_id: newStateId,
      municipio_id: undefined, // Reset city when state changes
    });
    setSelectedCity(null);
    loadCities(newStateId);
  };

  const handleCityChange = (city: Municipio) => {
    setSelectedCity(city);
    onChange({
      ...value,
      municipio_id: city.id,
    });
  };

  const handleZipCodeChange = (newZipCode: string) => {
    setZipCode(newZipCode);

    onChange({
      ...value,
      cep: newZipCode,
    });
  };

  const filteredCities = cities;

  return (
    <div className="space-y-4">
      {/* ZIP code and search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="zipCode" className="mb-2">
            ZIP Code
          </Label>
          <Input
            id="zipCode"
            placeholder="00000-000"
            value={formatCEP(zipCode)}
            onChange={(e) => handleZipCodeChange(unformatCEP(e.target.value))}
            disabled={disabled}
            maxLength={9}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={searchByZipCode}
            disabled={disabled || loadingZipCode || !zipCode}
          >
            {loadingZipCode ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* State and City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">State</Label>
          <Select
            value={value.estado_id?.toString()}
            onValueChange={handleStateChange}
            disabled={true}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.nome} ({state.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2">City</Label>
          <Select
            value={value.municipio_id?.toString()}
            onValueChange={(value) => {
              const city = cities.find((c) => c.id.toString() === value);
              if (city) handleCityChange(city);
            }}
            disabled={true}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {loadingCities ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : filteredCities.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No cities found
                </SelectItem>
              ) : (
                filteredCities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {city.nome}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address fields */}
      {showAddressFields && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="mb-2">
              Address
            </Label>
            <Input
              id="address"
              placeholder="Street, Avenue, etc."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                onChange({ ...value, endereco: e.target.value });
              }}
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="number" className="mb-2">
                Number
              </Label>
              <Input
                id="number"
                placeholder="123"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  onChange({ ...value, numero: e.target.value });
                }}
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="complement" className="mb-2">
                Complement
              </Label>
              <Input
                id="complement"
                placeholder="Apt, Suite, etc."
                value={complement}
                onChange={(e) => {
                  setComplement(e.target.value);
                  onChange({ ...value, complemento: e.target.value });
                }}
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="district" className="mb-2">
                District
              </Label>
              <Input
                id="district"
                placeholder="Downtown, etc."
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
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
