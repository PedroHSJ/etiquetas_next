"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@/contexts/OrganizationContext";
import { NavigationButton } from "@/components/ui/navigation-button";
import { DepartmentService } from "@/lib/services/client/department-service";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const { organizations, selectedOrganization } = useOrganization();

  const [formData, setFormData] = useState({
    name: "",
    organizationId: selectedOrganization?.id || "",
    departmentType: "",
  });
  const [saving, setSaving] = useState(false);

  // Atualizar organização quando selectedOrganization mudar
  useEffect(() => {
    if (selectedOrganization && !formData.organizationId) {
      setFormData((prev) => ({
        ...prev,
        organizationId: selectedOrganization.id,
      }));
    }
  }, [selectedOrganization, formData.organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.organizationId || !formData.departmentType) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setSaving(true);

    try {
      await DepartmentService.createDepartment({
        name: formData.name.trim(),
        organizationId: formData.organizationId,
        departmentType: formData.departmentType,
      });

      toast.success("Departamento criado com sucesso!");
      router.push("/departments/list");
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao criar departamento");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const departmentTypes = [
    { value: "louvor", label: "Louvor/Música" },
    { value: "infantil", label: "Ministério Infantil" },
    { value: "jovens", label: "Ministério de Jovens" },
    { value: "adoracao", label: "Adoração" },
    { value: "midia", label: "Mídia/Audiovisual" },
    { value: "recepcao", label: "Recepção" },
    { value: "limpeza", label: "Limpeza" },
    { value: "seguranca", label: "Segurança" },
    { value: "vendas", label: "Vendas" },
    { value: "marketing", label: "Marketing" },
    { value: "ti", label: "Tecnologia da Informação" },
    { value: "rh", label: "Recursos Humanos" },
    { value: "financeiro", label: "Financeiro" },
    { value: "operacional", label: "Operacional" },
    { value: "administrativo", label: "Administrativo" },
    { value: "outro", label: "Outro" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <NavigationButton href="/departments/list" variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
        </NavigationButton>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Novo Departamento</h1>
            <p className="text-muted-foreground">
              Crie um novo departamento para uma de suas organizações
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Departamento</CardTitle>
            <CardDescription>
              Preencha as informações básicas do novo departamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizacao">Organização</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) =>
                    handleInputChange("organizationId", value)
                  }
                  disabled={saving}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center gap-2">
                          {org.id === selectedOrganization?.id && (
                            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                              Atual
                            </span>
                          )}
                          {org.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrganization && (
                  <p className="text-xs text-muted-foreground">
                    A organização atual ({selectedOrganization.name}) está
                    pré-selecionada
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Departamento</Label>
                <Input
                  id="nome"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome do departamento"
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Departamento</Label>
                <Select
                  value={formData.departmentType}
                  onValueChange={(value) =>
                    handleInputChange("departmentType", value)
                  }
                  disabled={saving}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <NavigationButton
                  href="/departments/list"
                  variant="outline"
                  disabled={saving}
                >
                  Cancelar
                </NavigationButton>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Departamento
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
