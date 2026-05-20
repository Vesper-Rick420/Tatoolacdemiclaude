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
import { createClient } from "@/lib/supabase/client";
import {
  updateProfile,
  createAvatarUploadUrl,
  setAvatar,
} from "@/lib/actions/profile";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/profile";
import { STORAGE_BUCKETS } from "@/lib/constants";

const MAX_AVATAR_MB = 5;

export function ProfileForm({
  initialName,
  username,
  avatarUrl,
}: {
  initialName: string;
  username: string;
  avatarUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: initialName },
  });

  function onSubmit(values: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Perfil actualizado.");
    });
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      toast.error(`La imagen supera los ${MAX_AVATAR_MB} MB.`);
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

      const signed = await createAvatarUploadUrl(ext);
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

      const result = await setAvatar(signed.path);
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Foto actualizada.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Foto de perfil */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Foto de perfil" />}
          <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">
            {getInitials(initialName || username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploadingAvatar}
            onChange={handleAvatarChange}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploadingAvatar}
            onClick={() => fileRef.current?.click()}
          >
            {uploadingAvatar ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            Cambiar foto
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG o PNG, máximo {MAX_AVATAR_MB} MB.
          </p>
        </div>
      </div>

      {/* Datos */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-sm text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input id="username" defaultValue={username} disabled />
          <p className="text-xs text-muted-foreground">
            El nombre de usuario no se puede cambiar.
          </p>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </div>
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
