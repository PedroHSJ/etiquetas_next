"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StorageLocationService } from "@/lib/services/client/storage-location-service";
import { StorageLocationResponseDto } from "@/types/dto/storage-location";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().optional(),
});

interface StorageLocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
  editingLocation?: StorageLocationResponseDto;
  parentLocation?: StorageLocationResponseDto;
  onSuccess: () => void;
}

export function StorageLocationForm({
  open,
  onOpenChange,
  organizationId,
  editingLocation,
  parentLocation,
  onSuccess,
}: StorageLocationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editingLocation) {
        reset({
          name: editingLocation.name,
          description: editingLocation.description || "",
        });
      } else {
        reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, editingLocation, reset]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (!organizationId) {
      toast.error("Organização não identificada.");
      return;
    }

    try {
      if (editingLocation) {
        await StorageLocationService.updateStorageLocation(editingLocation.id, {
          name: data.name,
          description: data.description,
        });
        toast.success("Local atualizado com sucesso!");
      } else {
        await StorageLocationService.createStorageLocation({
          name: data.name,
          description: data.description,
          organizationId,
          parentId: parentLocation?.id,
        });
        toast.success("Local criado com sucesso!");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar local.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingLocation
              ? "Editar Localização"
              : parentLocation
                ? `Nova sub-localização em "${parentLocation.name}"`
                : "Nova Localização Raiz"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Estante A"
            />
            {errors.name && (
              <span className="text-sm text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Ex: Prateleira superior"
            />
            {errors.description && (
              <span className="text-sm text-red-500">
                {errors.description.message}
              </span>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editingLocation ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
