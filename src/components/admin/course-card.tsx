"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  EllipsisVertical,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseFormDialog } from "@/components/admin/course-form-dialog";
import { toggleCoursePublished, deleteCourse } from "@/lib/actions/courses";
import type { CourseRow, LevelOption } from "@/components/admin/courses-manager";

export function CourseCard({
  course,
  levels,
}: {
  course: CourseRow;
  levels: LevelOption[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function notify(result: { error?: string; success?: string }) {
    if (result.error) toast.error(result.error);
    else if (result.success) toast.success(result.success);
  }

  function handlePublish() {
    startTransition(async () => {
      notify(await toggleCoursePublished(course.id, !course.isPublished));
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCourse(course.id);
      notify(result);
      if (!result.error) setDeleteOpen(false);
    });
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
          <BookOpen className="h-5 w-5 text-primary" />
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Acciones" />
            }
          >
            <EllipsisVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePublish}>
              {course.isPublished ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Publicar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mt-3 font-semibold leading-tight">{course.title}</h3>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="secondary">{course.levelName}</Badge>
        <Badge variant={course.isPublished ? "default" : "outline"}>
          {course.isPublished ? "Publicado" : "Borrador"}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {course.description || "Sin descripción."}
      </p>

      <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <Layers className="h-3.5 w-3.5" />
        {course.moduleCount} módulo(s)
      </div>

      {editOpen && (
        <CourseFormDialog
          open
          onOpenChange={setEditOpen}
          levels={levels}
          course={course}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar curso?</DialogTitle>
            <DialogDescription>
              Se eliminará <strong>{course.title}</strong> con todos sus
              módulos y lecciones. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
