"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Printer, Loader2 } from "lucide-react";
import { SettingsService } from "@/lib/services/client/settings-service";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";

interface PrinterConfigDialogProps {
  trigger?: React.ReactNode;
}

export function PrinterConfigDialog({ trigger }: PrinterConfigDialogProps) {
  const { activeProfile } = useProfile();
  const organizationId = activeProfile?.userOrganization?.organization?.id;
  const [open, setOpen] = useState(false);
  const [printerName, setPrinterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && organizationId) {
      loadSettings();
    }
  }, [open, organizationId]);

  const loadSettings = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const name = await SettingsService.getPrinterName(organizationId);
      setPrinterName(name || "");
    } catch (error) {
      console.error("Error loading printer settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast.error("Organização não identificada.");
      return;
    }

    if (!printerName.trim()) {
      toast.error("O nome da impressora não pode estar vazio.");
      return;
    }

    setSaving(true);
    try {
      const success = await SettingsService.setSetting(
        organizationId,
        "printer_name",
        printerName.trim(),
      );

      if (success) {
        toast.success("Configuração da impressora salva!");
        setOpen(false);
      } else {
        toast.error("Erro ao salvar configuração.");
      }
    } catch (error) {
      console.error("Error saving printer settings:", error);
      toast.error("Ocorreu um erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar Impressora
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Configuração de Impressão
          </DialogTitle>
          <DialogDescription>
            Defina o nome da impressora térmica instalada no sistema (ex: LABEL
            PRINTER).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="printer-name">Nome da Impressora</Label>
            <div className="flex gap-2">
              <Input
                id="printer-name"
                value={printerName}
                onChange={(e) => setPrinterName(e.target.value)}
                placeholder="Ex: LABEL PRINTER"
                disabled={loading || saving}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Este nome deve ser exatamente o mesmo configurado no seu agente de
              impressão local.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || saving || !printerName.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Configuração"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
