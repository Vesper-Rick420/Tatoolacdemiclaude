import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  CoursesManager,
  type CourseRow,
  type LevelOption,
} from "@/components/admin/courses-manager";

export const metadata: Metadata = { title: "Cursos" };

export default async function CursosPage() {
  const [courses, levels] = await Promise.all([
    prisma.course.findMany({
      orderBy: [{ level: { order: "asc" } }, { order: "asc" }],
      include: {
        level: { select: { name: true } },
        _count: { select: { modules: true } },
      },
    }),
    prisma.level.findMany({ orderBy: { order: "asc" } }),
  ]);

  const courseRows: CourseRow[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    levelId: c.levelId,
    levelName: c.level.name,
    isPublished: c.isPublished,
    moduleCount: c._count.modules,
  }));

  const levelOptions: LevelOption[] = levels.map((l) => ({
    id: l.id,
    name: l.name,
  }));

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Cursos</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} curso(s) en total
        </p>
      </header>

      <CoursesManager courses={courseRows} levels={levelOptions} />
    </div>
  );
}
