"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createModule, updateModule } from "@/lib/actions/content";
import { moduleSchema, type ModuleInput } from "@/lib/validations/content";

export function ModuleFormDialog({
  open,
  onOpenChange,
  courseId,
  module,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  /** Si se pasa, el diálogo está en modo edición. */
  module?: { id: string; title: string };
}) {
  const isEdit = Boolean(module);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModuleInput>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: module?.title ?? "" },
  });

  function onSubmit(values: ModuleInput) {
    startTransition(async () => {
      const result =
        isEdit && module
          ? await updateModule(module.id, values)
          : await createModule(courseId, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Guardado.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar módulo" : "Nuevo módulo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label htmlFor="module-title">Título del módulo</Label>
            <Input id="module-title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar" : "Crear módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
