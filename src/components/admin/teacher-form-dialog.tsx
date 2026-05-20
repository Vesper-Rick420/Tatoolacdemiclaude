"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { createClient } from "@/lib/supabase/client";
import {
  createTeacher,
  updateTeacher,
  createTeacherPhotoUploadUrl,
  setTeacherPhoto,
} from "@/lib/actions/site-content";
import {
  teacherSchema,
  type TeacherInput,
} from "@/lib/validations/site-content";
import { STORAGE_BUCKETS } from "@/lib/constants";

type Teacher = {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
};

export function TeacherFormDialog({
  open,
  onOpenChange,
  teacher,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se pasa, el diálogo está en modo edición. */
  teacher?: Teacher;
}) {
  const isEdit = Boolean(teacher);
  const [isPending, startTransition] = useTransition();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: teacher?.name ?? "",
      specialty: teacher?.specialty ?? "",
      instagramUrl: teacher?.instagramUrl ?? "",
      facebookUrl: teacher?.facebookUrl ?? "",
    },
  });

  function onSubmit(values: TeacherInput) {
    startTransition(async () => {
      const result =
        isEdit && teacher
          ? await updateTeacher(teacher.id, values)
          : await createTeacher(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Guardado.");
      onOpenChange(false);
    });
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !teacher) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera los 5 MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const signed = await createTeacherPhotoUploadUrl(teacher.id, ext);
      if ("error" in signed) {
        toast.error(signed.error);
        return;
      }
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.avatars)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) {
        toast.error(`Error al subir la imagen: ${uploadError.message}`);
        return;
      }
      const result = await setTeacherPhoto(teacher.id, signed.path);
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Foto actualizada.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar profesor" : "Nuevo profesor"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del profesor."
              : "Crea el profesor; podrás añadir su foto al editarlo."}
          </DialogDescription>
        </DialogHeader>

        {/* Foto (solo en edición) */}
        {isEdit && teacher && (
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {teacher.photoUrl && (
                <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
              )}
              <AvatarFallback className="bg-primary/15 text-primary">
                {getInitials(teacher.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingPhoto}
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingPhoto}
                onClick={() => fileRef.current?.click()}
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Cambiar foto
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input id="specialty" {...register("specialty")} />
            {errors.specialty && (
              <p className="text-sm text-destructive">
                {errors.specialty.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram (enlace)</Label>
            <Input
              id="instagramUrl"
              placeholder="https://instagram.com/..."
              {...register("instagramUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook (enlace)</Label>
            <Input
              id="facebookUrl"
              placeholder="https://facebook.com/..."
              {...register("facebookUrl")}
            />
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
              {isEdit ? "Guardar" : "Crear profesor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
