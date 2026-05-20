"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  EllipsisVertical,
  Eye,
  EyeOff,
  Layers,
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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          {course.moduleCount} módulo(s)
        </span>
        <Link
          href={`/admin/cursos/${course.id}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Gestionar contenido →
        </Link>
      </div>

      {editOpen && (
        <CourseFormDialog
          open
          onOpenChange={setEditOpen}
          levels={levels}
          course={course}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={isPending}
        title="¿Eliminar curso?"
        description={`Se eliminará "${course.title}" con todos sus módulos y lecciones. Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
