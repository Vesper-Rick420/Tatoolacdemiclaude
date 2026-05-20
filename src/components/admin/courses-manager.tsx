"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/admin/course-card";
import { CourseFormDialog } from "@/components/admin/course-form-dialog";

export type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  levelId: string;
  levelName: string;
  isPublished: boolean;
  moduleCount: number;
};

export type LevelOption = { id: string; name: string };

export function CoursesManager({
  courses,
  levels,
}: {
  courses: CourseRow[];
  levels: LevelOption[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Crear curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Aún no hay cursos</p>
          <p className="text-sm text-muted-foreground">
            Crea el primer curso para empezar a organizar el contenido.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} levels={levels} />
          ))}
        </div>
      )}

      {createOpen && (
        <CourseFormDialog
          open
          onOpenChange={setCreateOpen}
          levels={levels}
        />
      )}
    </div>
  );
}
