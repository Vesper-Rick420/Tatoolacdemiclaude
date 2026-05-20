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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCourse, updateCourse } from "@/lib/actions/courses";
import { courseSchema, type CourseInput } from "@/lib/validations/course";
import type { CourseRow, LevelOption } from "@/components/admin/courses-manager";

export function CourseFormDialog({
  open,
  onOpenChange,
  levels,
  course,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels: LevelOption[];
  /** Si se pasa un curso, el diálogo está en modo edición. */
  course?: CourseRow;
}) {
  const isEdit = Boolean(course);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      levelId: course?.levelId ?? levels[0]?.id ?? "",
    },
  });

  function onSubmit(values: CourseInput) {
    startTransition(async () => {
      const result =
        isEdit && course
          ? await updateCourse(course.id, values)
          : await createCourse(values);
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
          <DialogTitle>{isEdit ? "Editar curso" : "Nuevo curso"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del curso."
              : "Crea un curso dentro de un nivel."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
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

          <div className="space-y-2">
            <Label htmlFor="levelId">Nivel</Label>
            <select
              id="levelId"
              {...register("levelId")}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
            {errors.levelId && (
              <p className="text-sm text-destructive">
                {errors.levelId.message}
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
              {isEdit ? "Guardar cambios" : "Crear curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
