"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import {
  createResourceUploadUrl,
  createResource,
  deleteResource,
} from "@/lib/actions/resources";
import { STORAGE_BUCKETS } from "@/lib/constants";

const MAX_SIZE_MB = 50;

type ResourceItem = { id: string; name: string; type: string };

export function LessonResourcesDialog({
  open,
  onOpenChange,
  lessonId,
  resources,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  resources: ResourceItem[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo supera los ${MAX_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";

      const signed = await createResourceUploadUrl(lessonId, ext);
      if ("error" in signed) {
        toast.error(signed.error);
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.resources)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) {
        toast.error(`Error al subir: ${uploadError.message}`);
        return;
      }

      const result = await createResource(lessonId, {
        name: file.name,
        ext,
        filePath: signed.path,
        sizeBytes: file.size,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Recurso añadido.");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteResource(id)
      .then((result) => {
        if (result.error) toast.error(result.error);
        else toast.success(result.success ?? "Recurso eliminado.");
      })
      .finally(() => setDeletingId(null));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!uploading) onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recursos de la lección</DialogTitle>
          <DialogDescription>
            Archivos descargables (PDF, imágenes...). Al estudiante se le
            entregan con marca de agua.
          </DialogDescription>
        </DialogHeader>

        {/* Lista de recursos */}
        <div className="space-y-2">
          {resources.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay recursos en esta lección.
            </p>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <ResourceIcon type={resource.type} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {resource.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Eliminar recurso"
                  disabled={deletingId === resource.id}
                  onClick={() => handleDelete(resource.id)}
                >
                  {deletingId === resource.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Subir nuevo */}
        <div className="space-y-2 border-t border-border pt-3">
          <input
            ref={fileRef}
            type="file"
            disabled={uploading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
          />
          <Button
            className="w-full"
            disabled={uploading || !file}
            onClick={handleUpload}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo..." : "Subir recurso"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResourceIcon({ type }: { type: string }) {
  if (type === "pdf")
    return <FileText className="h-4 w-4 shrink-0 text-primary" />;
  if (type === "imagen")
    return <ImageIcon className="h-4 w-4 shrink-0 text-primary" />;
  return <File className="h-4 w-4 shrink-0 text-primary" />;
}
