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
import { createLesson, updateLesson } from "@/lib/actions/content";
import { lessonSchema, type LessonInput } from "@/lib/validations/content";

export function LessonFormDialog({
  open,
  onOpenChange,
  moduleId,
  lesson,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Necesario al crear (no al editar). */
  moduleId?: string;
  /** Si se pasa, el diálogo está en modo edición. */
  lesson?: {
    id: string;
    title: string;
    description: string | null;
    isFree: boolean;
  };
}) {
  const isEdit = Boolean(lesson);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      isFree: lesson?.isFree ?? false,
    },
  });

  function onSubmit(values: LessonInput) {
    startTransition(async () => {
      const result =
        isEdit && lesson
          ? await updateLesson(lesson.id, values)
          : await createLesson(moduleId ?? "", values);
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
          <DialogTitle>
            {isEdit ? "Editar lección" : "Nueva lección"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Título</Label>
            <Input id="lesson-title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Descripción</Label>
            <textarea
              id="lesson-description"
              rows={3}
              {...register("description")}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register("isFree")}
              className="size-4 rounded border-input accent-primary"
            />
            Lección gratuita (visible sin desbloquear el nivel)
          </label>

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
              {isEdit ? "Guardar" : "Crear lección"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
