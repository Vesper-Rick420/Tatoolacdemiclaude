"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Layers,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ModuleFormDialog } from "@/components/admin/module-form-dialog";
import { LessonFormDialog } from "@/components/admin/lesson-form-dialog";
import { LessonVideoDialog } from "@/components/admin/lesson-video-dialog";
import { LessonResourcesDialog } from "@/components/admin/lesson-resources-dialog";
import { deleteModule, deleteLesson } from "@/lib/actions/content";

export type ResourceItem = { id: string; name: string; type: string };

export type LessonItem = {
  id: string;
  title: string;
  description: string | null;
  isFree: boolean;
  hasVideo: boolean;
  resources: ResourceItem[];
};

export type ModuleItem = {
  id: string;
  title: string;
  lessons: LessonItem[];
};

export type CourseDetail = {
  id: string;
  title: string;
  levelName: string;
  isPublished: boolean;
  modules: ModuleItem[];
};

export function CourseContent({ course }: { course: CourseDetail }) {
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  return (
    <div className="space-y-6 p-6 lg:p-10">
      {/* Cabecera */}
      <div>
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="secondary">{course.levelName}</Badge>
              <Badge variant={course.isPublished ? "default" : "outline"}>
                {course.isPublished ? "Publicado" : "Borrador"}
              </Badge>
            </div>
          </div>
          <Button onClick={() => setAddModuleOpen(true)}>
            <Plus className="h-4 w-4" />
            Añadir módulo
          </Button>
        </div>
      </div>

      {/* Módulos */}
      {course.modules.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Layers className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Este curso aún no tiene módulos</p>
          <p className="text-sm text-muted-foreground">
            Crea un módulo para empezar a añadir lecciones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {course.modules.map((module, index) => (
            <ModuleSection
              key={module.id}
              module={module}
              index={index}
              courseId={course.id}
            />
          ))}
        </div>
      )}

      {addModuleOpen && (
        <ModuleFormDialog
          open
          onOpenChange={setAddModuleOpen}
          courseId={course.id}
        />
      )}
    </div>
  );
}

function ModuleSection({
  module,
  index,
  courseId,
}: {
  module: ModuleItem;
  index: number;
  courseId: string;
}) {
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteModule(module.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Módulo eliminado.");
      setDeleteOpen(false);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <h3 className="font-semibold">
          Módulo {index + 1}: {module.title}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar módulo"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Eliminar módulo"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {module.lessons.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Este módulo aún no tiene lecciones.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonRow key={lesson.id} lesson={lesson} index={lessonIndex} />
          ))}
        </div>
      )}

      <div className="p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddLessonOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Añadir lección
        </Button>
      </div>

      {addLessonOpen && (
        <LessonFormDialog
          open
          onOpenChange={setAddLessonOpen}
          moduleId={module.id}
        />
      )}
      {editOpen && (
        <ModuleFormDialog
          open
          onOpenChange={setEditOpen}
          courseId={courseId}
          module={module}
        />
      )}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={isPending}
        title="¿Eliminar módulo?"
        description={`Se eliminará "${module.title}" y todas sus lecciones.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function LessonRow({ lesson, index }: { lesson: LessonItem; index: number }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLesson(lesson.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Lección eliminada.");
      setDeleteOpen(false);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lesson.title}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            {lesson.isFree && <Badge variant="secondary">Gratis</Badge>}
            <span
              className={
                lesson.hasVideo ? "text-primary" : "text-muted-foreground"
              }
            >
              {lesson.hasVideo ? "● Con video" : "○ Sin video"}
            </span>
            {lesson.resources.length > 0 && (
              <span className="text-muted-foreground">
                · {lesson.resources.length} recurso(s)
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Video de la lección"
          onClick={() => setVideoOpen(true)}
        >
          <Video
            className={lesson.hasVideo ? "h-4 w-4 text-primary" : "h-4 w-4"}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Recursos de la lección"
          onClick={() => setResourcesOpen(true)}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Editar lección"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Eliminar lección"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {videoOpen && (
        <LessonVideoDialog
          open
          onOpenChange={setVideoOpen}
          lessonId={lesson.id}
          hasVideo={lesson.hasVideo}
        />
      )}
      {resourcesOpen && (
        <LessonResourcesDialog
          open
          onOpenChange={setResourcesOpen}
          lessonId={lesson.id}
          resources={lesson.resources}
        />
      )}
      {editOpen && (
        <LessonFormDialog open onOpenChange={setEditOpen} lesson={lesson} />
      )}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={isPending}
        title="¿Eliminar lección?"
        description={`Se eliminará "${lesson.title}".`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
