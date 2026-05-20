"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { createVideoUploadUrl, setLessonVideo } from "@/lib/actions/content";
import { STORAGE_BUCKETS } from "@/lib/constants";

const MAX_SIZE_MB = 500;

export function LessonVideoDialog({
  open,
  onOpenChange,
  lessonId,
  hasVideo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  hasVideo: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) {
      toast.error("Selecciona un archivo de video.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("El archivo debe ser un video.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El video supera el límite de ${MAX_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";

      // 1. El servidor genera una URL firmada de subida.
      const signed = await createVideoUploadUrl(lessonId, ext);
      if ("error" in signed) {
        toast.error(signed.error);
        return;
      }

      // 2. El navegador sube el archivo directo a Storage.
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.videos)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) {
        toast.error(`Error al subir el video: ${uploadError.message}`);
        return;
      }

      // 3. El servidor guarda la ruta en la lección.
      const result = await setLessonVideo(lessonId, signed.path);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Video subido correctamente.");
      onOpenChange(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // No permitir cerrar mientras se sube.
        if (!uploading) onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasVideo ? "Reemplazar video" : "Subir video"}
          </DialogTitle>
          <DialogDescription>
            El archivo se sube directamente a Supabase Storage. Tamaño máximo{" "}
            {MAX_SIZE_MB} MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="video-file">Archivo de video</Label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            disabled={uploading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button disabled={uploading || !file} onClick={handleUpload}>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo..." : "Subir video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
