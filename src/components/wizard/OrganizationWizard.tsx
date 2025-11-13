"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LocationSelector } from "@/components/location/LocationSelector";
import { TIPOS_UAN, TipoUAN } from "@/types/uan";
import { InputHookForm } from "@/components/inputs/InputHookForm";
import { SelectHookForm } from "@/components/inputs/SelectHookForm";
import { TextareaHookForm } from "@/components/inputs/TextareaHookForm";
import { CheckCircle, Building2, Users, X } from "lucide-react";
import { useOrganizationWizard } from "@/hooks/useOrganizationWizard";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

// Schema de validação do formulário
const uanFormSchema = z.object({
  organizationName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().optional(),
  uanType: z.string().optional(),
  capacity: z.number().optional(),
  mainPhone: z.string().optional(),
  description: z.string().optional(),
  stateId: z.number().optional(),
  cityId: z.number().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  addressComplement: z.string().optional(),
  district: z.string().optional(),
});

type UANFormData = z.infer<typeof uanFormSchema>;

interface OrganizationWizardProps {
  userId: string;
  onComplete: (organizationId: string, organizationName: string) => void;
}

export function OrganizationWizard({
  userId,
  onComplete,
}: OrganizationWizardProps) {
  const {
    currentStep,
    wizardData,
    isLoading,
    nextStep,
    prevStep,
    updateWizardData,
    submitWizard,
    getTotalSteps,
  } = useOrganizationWizard();

  // React Hook Form
  const form = useForm<UANFormData>({
    resolver: zodResolver(uanFormSchema),
    defaultValues: {
      organizationName: wizardData.organizationName || "",
      cnpj: wizardData.uanData.cnpj || "",
      uanType: wizardData.uanData.uanType || "",
      capacity: wizardData.uanData.capacity,
      mainPhone: wizardData.uanData.mainPhone || "",
      description: wizardData.uanData.description || "",
      stateId: wizardData.uanData.stateId,
      cityId: wizardData.uanData.cityId,
      zipCode: wizardData.uanData.zipCode || "",
      address: wizardData.uanData.address || "",
      number: wizardData.uanData.number || "",
      addressComplement: wizardData.uanData.addressComplement || "",
      district: wizardData.uanData.district || "",
    },
  });

  const { control, watch, setValue, getValues } = form;
  const formValues = watch();

  const [customDepartmentName, setCustomDepartmentName] = useState("");
  const {
    data: profilesData,
    isLoading: isProfilesLoading,
    error: profilesError,
  } = useProfilesQuery();
  const profiles = profilesData ?? [];

  // Debug do erro da query
  const managerProfileId = useMemo(() => {
    const targets = ["gestor", "manager"];
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    console.log("⚙️ Perfis disponíveis para o usuário:", profiles);
    const found = profiles.find((profile) =>
      targets.includes(normalize(profile.name))
    );
    console.log("⚙️ Perfil de gestor encontrado:", found);
    return found?.id;
  }, [profiles]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formValues.organizationName &&
          formValues.organizationName.trim().length >= 3
        );
      case 2:
        return (
          wizardData.selectedDepartments.length > 0 ||
          wizardData.customDepartments.length > 0
        );
      case 3:
        return true; // Review sempre pode ser enviado
      default:
        return false;
    }
  };

  const isFinishDisabled =
    !canProceed() || isLoading || isProfilesLoading || !managerProfileId;

  // Função para sincronizar dados do formulário com wizardData
  const syncFormToWizardData = () => {
    const values = getValues();
    updateWizardData({
      organizationName: values.organizationName || "",
      uanData: {
        cnpj: values.cnpj,
        uanType: values.uanType as TipoUAN,
        capacity: values.capacity,
        mainPhone: values.mainPhone,
        description: values.description,
        stateId: values.stateId,
        cityId: values.cityId,
        zipCode: values.zipCode,
        address: values.address,
        number: values.number,
        addressComplement: values.addressComplement,
        district: values.district,
      },
    });
  };

  const handleNextStep = () => {
    // Sincronizar dados antes de avançar
    if (currentStep === 1) {
      syncFormToWizardData();
    }
    nextStep();
  };

  const handleSubmit = async () => {
    if (!managerProfileId) {
      toast.error(
        "Erro: Não foi possível carregar os perfis de usuário. " +
          "Verifique sua conexão e tente novamente."
      );
      return;
    }

    // Sincronizar dados do formulário com wizardData antes de enviar
    syncFormToWizardData();

    const result = await submitWizard(userId, { managerProfileId });
    if (result.success && result.organizationId) {
      onComplete(result.organizationId, formValues.organizationName || "");
    }
  };

  const addCustomDepartment = () => {
    if (customDepartmentName.trim()) {
      const newDept = {
        nome: customDepartmentName.trim(),
        tipo: customDepartmentName.toLowerCase().replace(/\s+/g, "_"),
      };
      updateWizardData({
        customDepartments: [...wizardData.customDepartments, newDept],
      });
      setCustomDepartmentName("");
    }
  };

  const removeCustomDepartment = (index: number) => {
    const deptToRemove = wizardData.customDepartments[index];
    const updated = wizardData.customDepartments.filter((_, i) => i !== index);

    updateWizardData({
      customDepartments: updated,
    });
  };

  const toggleDepartment = (dept: { nome: string; tipo: string }) => {
    const isSelected = wizardData.selectedDepartments.some(
      (d) => d.tipo === dept.tipo
    );
    if (isSelected) {
      updateWizardData({
        selectedDepartments: wizardData.selectedDepartments.filter(
          (d) => d.tipo !== dept.tipo
        ),
      });
    } else {
      updateWizardData({
        selectedDepartments: [...wizardData.selectedDepartments, dept],
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-4">
              <InputHookForm
                control={control}
                name="organizationName"
                label="Nome da UAN"
                placeholder="Ex: UAN Hospital Central, UAN Escola Municipal"
                colSpan="12"
                required
                tip="Informe o nome da sua Unidade de Alimentação e Nutrição"
              />

              <InputHookForm
                control={control}
                name="cnpj"
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                format="##.###.###/####-##"
                colSpan="6"
              />

              <SelectHookForm
                control={control}
                name="uanType"
                label="Tipo de UAN"
                placeholder="Selecione o tipo"
                options={Object.entries(TIPOS_UAN).map(([key, value]) => ({
                  value: key,
                  label: value as string,
                }))}
                colSpan="6"
              />

              <InputHookForm
                control={control}
                name="capacity"
                label="Capacidade diária"
                placeholder="Ex: 500 refeições/dia"
                type="number"
                colSpan="6"
              />

              <InputHookForm
                control={control}
                name="mainPhone"
                label="Telefone principal"
                placeholder="(11) 99999-9999"
                format="(##) #####-####"
                colSpan="6"
              />

              <TextareaHookForm
                control={control}
                name="description"
                label="Descrição"
                placeholder="Descreva brevemente sua UAN..."
                colSpan="12"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-medium mb-2">Localização</Label>
              <div className="mt-2">
                <LocationSelector
                  value={{
                    estado_id: formValues.stateId,
                    municipio_id: formValues.cityId,
                    cep: formValues.zipCode,
                    endereco: formValues.address,
                    numero: formValues.number,
                    complemento: formValues.addressComplement,
                    bairro: formValues.district,
                  }}
                  onChange={(localidade: {
                    estado_id?: number;
                    municipio_id?: number;
                    cep?: string;
                    endereco?: string;
                    numero?: string;
                    complemento?: string;
                    bairro?: string;
                  }) => {
                    setValue("stateId", localidade.estado_id);
                    setValue("cityId", localidade.municipio_id);
                    setValue("zipCode", localidade.cep);
                    setValue("address", localidade.endereco);
                    setValue("number", localidade.numero);
                    setValue("addressComplement", localidade.complemento);
                    setValue("district", localidade.bairro);
                  }}
                  showAddressFields={true}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">
                Selecione os{" "}
                {wizardData.template?.terminologia.departamento ||
                  "Departamentos"}
              </h3>

              {wizardData.template?.departamentos && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {wizardData.template.departamentos.map(
                    (dept: { nome: string; tipo: string }) => (
                      <div
                        key={dept.tipo}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={dept.tipo}
                          checked={wizardData.selectedDepartments.some(
                            (d) => d.tipo === dept.tipo
                          )}
                          onCheckedChange={() => toggleDepartment(dept)}
                        />
                        <Label htmlFor={dept.tipo} className="flex-1">
                          {dept.nome}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <Label htmlFor="customDept" className="mb-2">
                  Adicionar{" "}
                  {wizardData.template?.terminologia.departamento ||
                    "Departamento"}{" "}
                  personalizado
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="customDept"
                    placeholder="Nome do departamento"
                    value={customDepartmentName}
                    onChange={(e) => setCustomDepartmentName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addCustomDepartment();
                      }
                    }}
                  />
                  <Button onClick={addCustomDepartment} variant="outline">
                    Adicionar
                  </Button>
                </div>
              </div>

              {wizardData.customDepartments.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {wizardData.customDepartments.map((dept, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {dept.nome}
                        <button
                          onClick={() => removeCustomDepartment(index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">
                Resumo da configuração
              </h3>

              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-2">Visão geral da UAN</h4>
                <div className="grid grid-cols-2">
                  <span className="text-sm">Nome:</span>
                  <span className="text-sm font-semibold">
                    {formValues.organizationName}
                  </span>
                  {formValues.cnpj && (
                    <>
                      <span className="text-sm">CNPJ:</span>
                      <span className="text-sm font-semibold">
                        {formValues.cnpj}
                      </span>
                    </>
                  )}
                  {formValues.uanType && (
                    <>
                      <span className="text-sm">Tipo de UAN:</span>
                      <span className="text-sm font-semibold">
                        {
                          TIPOS_UAN[
                            formValues.uanType as keyof typeof TIPOS_UAN
                          ]
                        }
                      </span>
                    </>
                  )}
                  {formValues.capacity && (
                    <>
                      <span className="text-sm">Capacidade:</span>
                      <span className="text-sm font-semibold">
                        {formValues.capacity} refeições/dia
                      </span>
                    </>
                  )}
                  {formValues.mainPhone && (
                    <>
                      <span className="text-sm">Telefone:</span>
                      <span className="text-sm font-semibold">
                        {formValues.mainPhone}
                      </span>
                    </>
                  )}
                  {formValues.zipCode && (
                    <>
                      <span className="text-sm">CEP:</span>
                      <span className="text-sm font-semibold">
                        {formValues.zipCode}
                      </span>
                    </>
                  )}
                  {formValues.description && (
                    <>
                      <span className="text-sm">Descrição:</span>
                      <span className="text-sm font-semibold">
                        {formValues.description}
                      </span>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-2">
                  {[
                    ...wizardData.selectedDepartments,
                    ...wizardData.customDepartments,
                  ].length === 1
                    ? wizardData.template?.terminologia.departamento
                    : `${wizardData.template?.terminologia.departamento}s`}
                </h4>
                <div className="space-y-3">
                  {[
                    ...wizardData.selectedDepartments,
                    ...wizardData.customDepartments,
                  ].map((dept, index) => (
                    <div key={index} className="border-l-2 border-primary pl-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{dept.nome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✨ Sua UAN será criada com{" "}
                  {
                    [
                      ...wizardData.selectedDepartments,
                      ...wizardData.customDepartments,
                    ].length
                  }{" "}
                  {[
                    ...wizardData.selectedDepartments,
                    ...wizardData.customDepartments,
                  ].length === 1
                    ? "departamento configurado"
                    : "departamentos configurados"}
                  .
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: "UAN", icon: Building2 },
    { number: 2, title: "Departamentos", icon: Users },
    { number: 3, title: "Resumo", icon: CheckCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Configuração da UAN
        </h1>
        <p className="text-sm sm:text-base text-center text-muted-foreground mb-6">
          Vamos configurar sua Unidade de Alimentação e Nutrição para que você
          possa começar a gerenciar todos os departamentos
        </p>

        <Progress
          value={(currentStep / getTotalSteps()) * 100}
          className="mb-4"
        />

        <div className="flex justify-center overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4 px-4 sm:px-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2
                    ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    }
                  `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <span
                    className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 ${
                        isCompleted ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Passo {currentStep}: {steps[currentStep - 1]?.title || "Passo"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 &&
              "Informe as informações básicas sobre sua UAN"}
            {currentStep === 2 &&
              "Selecione os departamentos que fazem parte da sua UAN"}
            {currentStep === 3 &&
              "Revise todas as informações antes de finalizar"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="order-2 sm:order-1"
        >
          Voltar
        </Button>

        <div className="flex gap-2 order-1 sm:order-2">
          {currentStep < getTotalSteps() ? (
            <Button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className="w-full sm:w-auto"
            >
              Avançar
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isFinishDisabled}
              className="w-full sm:w-auto"
            >
              {isLoading
                ? "Criando..."
                : isProfilesLoading
                ? "Carregando perfis..."
                : "Finalizar e Criar UAN"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
