"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LocalidadeSelector } from "@/components/localidade/LocalidadeSelector";
import { TIPOS_UAN, TipoUAN } from "@/types/uan";
import { formatCNPJ, formatTelefone, formatCEP, unformatCNPJ, unformatTelefone } from "@/utils/masks";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Circle,
  Building2,
  Users,
  X,
} from "lucide-react";
import { useOrganizationWizard } from "@/hooks/useOrganizationWizard";
import { organizationTemplates } from "@/config/organization-templates";
import { Checkbox } from "@/components/ui/checkbox";

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

  const [customDepartmentName, setCustomDepartmentName] = useState("");

  const handleSubmit = async () => {
    const result = await submitWizard(userId);
    if (result.success && result.organizationId) {
      onComplete(result.organizationId, wizardData.organizationName);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.organizationName.trim().length >= 3;
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
            <div>
              <Label htmlFor="orgName" className="mb-2">Nome da UAN</Label>
              <Input
                id="orgName"
                placeholder="Ex: UAN Hospital Central, UAN Escola Municipal"
                value={wizardData.organizationName}
                onChange={(e) =>
                  updateWizardData({ organizationName: e.target.value })
                }
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Digite o nome da sua Unidade de Alimentação e Nutrição
              </p>
            </div>

            {/* Informações da UAN */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium mb-4">
                Dados da UAN
              </h4>

              <Card className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CNPJ */}
                  <div>
                    <Label htmlFor="cnpj" className="mb-2">CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formatCNPJ(wizardData.uanData.cnpj || "")}
                      onChange={(e) => {
                        const unformatted = unformatCNPJ(e.target.value);
                        updateWizardData({
                          uanData: {
                            ...wizardData.uanData,
                            cnpj: unformatted
                          }
                        });
                      }}
                    />
                  </div>

                  {/* Tipo UAN */}
                  <div>
                    <Label className="mb-2">Tipo da UAN</Label>
                    <Select
                      value={wizardData.uanData.tipo_uan}
                      onValueChange={(value) =>
                        updateWizardData({
                          uanData: {
                            ...wizardData.uanData,
                            tipo_uan: value as TipoUAN
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPOS_UAN).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacidade de Atendimento */}
                  <div>
                    <Label htmlFor="capacidade" className="mb-2">Capacidade de Atendimento</Label>
                    <Input
                      id="capacidade"
                      type="number"
                      placeholder="Ex: 500 refeições/dia"
                      value={wizardData.uanData.capacidade_atendimento || ""}
                      onChange={(e) =>
                        updateWizardData({
                          uanData: {
                            ...wizardData.uanData,
                            capacidade_atendimento: parseInt(e.target.value) || undefined
                          }
                        })
                      }
                    />
                  </div>

                  {/* Telefone Principal */}
                  <div>
                    <Label htmlFor="telefone" className="mb-2">Telefone Principal</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      value={formatTelefone(wizardData.uanData.telefone_principal || "")}
                      onChange={(e) => {
                        const unformatted = unformatTelefone(e.target.value);
                        updateWizardData({
                          uanData: {
                            ...wizardData.uanData,
                            telefone_principal: unformatted
                          }
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="descricao" className="mb-2">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva brevemente sua UAN..."
                    value={wizardData.uanData.descricao || ""}
                    onChange={(e) =>
                      updateWizardData({
                        uanData: {
                          ...wizardData.uanData,
                          descricao: e.target.value
                        }
                      })
                    }
                  />
                </div>

                {/* Localização */}
                <div>
                  <Label className="text-base font-medium mb-2">Localização</Label>
                  <div className="mt-2">
                    <LocalidadeSelector
                      value={{
                        estado_id: wizardData.uanData.estado_id,
                        municipio_id: wizardData.uanData.municipio_id,
                        cep: wizardData.uanData.cep,
                        endereco: wizardData.uanData.endereco,
                        numero: wizardData.uanData.numero,
                        complemento: wizardData.uanData.complemento,
                        bairro: wizardData.uanData.bairro
                      }}
                      onChange={(localidade: {
                        estado_id?: number;
                        municipio_id?: number;
                        cep?: string;
                        endereco?: string;
                        numero?: string;
                        complemento?: string;
                        bairro?: string;
                      }) =>
                        updateWizardData({
                          uanData: {
                            ...wizardData.uanData,
                            ...localidade
                          }
                        })
                      }
                      showAddressFields={true}
                    />
                  </div>
                </div>
              </Card>
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
                  {wizardData.template.departamentos.map((dept: { nome: string; tipo: string }) => (
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
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <Label htmlFor="customDept" className="mb-2">
                  Adicionar{" "}
                  {wizardData.template?.terminologia.departamento ||
                    "Departamento"}{" "}
                  Personalizado
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
                Resumo da Configuração
              </h3>

              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-2">UAN</h4>
                <p>
                  <strong>Nome:</strong> {wizardData.organizationName}
                </p>
                <p>
                  <strong>Tipo:</strong> Unidade de Alimentação e Nutrição
                </p>
                {wizardData.uanData.cnpj && (
                  <p>
                    <strong>CNPJ:</strong> {formatCNPJ(wizardData.uanData.cnpj)}
                  </p>
                )}
                {wizardData.uanData.tipo_uan && (
                  <p>
                    <strong>Tipo UAN:</strong> {TIPOS_UAN[wizardData.uanData.tipo_uan]}
                  </p>
                )}
                {wizardData.uanData.capacidade_atendimento && (
                  <p>
                    <strong>Capacidade:</strong> {wizardData.uanData.capacidade_atendimento} refeições/dia
                  </p>
                )}
                {wizardData.uanData.telefone_principal && (
                  <p>
                    <strong>Telefone:</strong> {formatTelefone(wizardData.uanData.telefone_principal)}
                  </p>
                )}
                {wizardData.uanData.cep && (
                  <p>
                    <strong>CEP:</strong> {formatCEP(wizardData.uanData.cep)}
                  </p>
                )}
                {wizardData.uanData.descricao && (
                  <p>
                    <strong>Descrição:</strong> {wizardData.uanData.descricao}
                  </p>
                )}
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
                  ].length === 1 ? "setor configurado" : "setores configurados"}.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 3 steps para UANs
  const steps = [
    { number: 1, title: "Informações da UAN", icon: Building2 },
    { number: 2, title: "Setores", icon: Users },
    { number: 3, title: "Resumo", icon: CheckCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Configuração da UAN
        </h1>
        <p className="text-sm sm:text-base text-center text-muted-foreground mb-6">
          Vamos configurar sua Unidade de Alimentação e Nutrição para começar a gerenciar os setores
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
            {currentStep === 1 && "Informe o nome da sua Unidade de Alimentação e Nutrição"}
            {currentStep === 2 &&
              "Selecione os setores que sua UAN possui"}
            {currentStep === 3 &&
              "Configure as especializações para cada setor"}
            {currentStep === 4 && "Revise as configurações antes de finalizar"}
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
          Anterior
        </Button>

        <div className="flex gap-2 order-1 sm:order-2">
          {currentStep < getTotalSteps() ? (
            <Button onClick={nextStep} disabled={!canProceed()} className="w-full sm:w-auto">
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Criando..." : "Finalizar Configuração"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
