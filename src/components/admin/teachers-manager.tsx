"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { TeacherFormDialog } from "@/components/admin/teacher-form-dialog";
import { deleteTeacher } from "@/lib/actions/site-content";

export type TeacherRow = {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
};

export function TeachersManager({ teachers }: { teachers: TeacherRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Profesores</CardTitle>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Añadir
        </Button>
      </CardHeader>
      <CardContent>
        {teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay profesores. Añade el primero.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {teachers.map((teacher) => (
              <TeacherAdminCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </CardContent>

      {createOpen && (
        <TeacherFormDialog open onOpenChange={setCreateOpen} />
      )}
    </Card>
  );
}

function TeacherAdminCard({ teacher }: { teacher: TeacherRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTeacher(teacher.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Profesor eliminado.");
      setDeleteOpen(false);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Avatar className="h-12 w-12">
        {teacher.photoUrl && (
          <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
        )}
        <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
          {getInitials(teacher.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{teacher.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {teacher.specialty}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Editar profesor"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Eliminar profesor"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {editOpen && (
        <TeacherFormDialog
          open
          onOpenChange={setEditOpen}
          teacher={teacher}
        />
      )}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={isPending}
        title="¿Eliminar profesor?"
        description={`Se eliminará a "${teacher.name}" de la página de inicio.`}
        onConfirm={handleDelete}
      />
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
