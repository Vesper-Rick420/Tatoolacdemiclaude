import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import {
  TeachersManager,
  type TeacherRow,
} from "@/components/admin/teachers-manager";

export const metadata: Metadata = { title: "Contenido del sitio" };

export default async function ContenidoPage() {
  const [settings, teachers] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.teacher.findMany({ orderBy: { order: "asc" } }),
  ]);

  const teacherRows: TeacherRow[] = teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    specialty: teacher.specialty,
    photoUrl: teacher.photoUrl,
    instagramUrl: teacher.instagramUrl,
    facebookUrl: teacher.facebookUrl,
  }));

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Contenido del sitio</h1>
        <p className="text-sm text-muted-foreground">
          Edita la misión, la visión y los profesores que se muestran en la
          página de inicio.
        </p>
      </header>

      <SiteSettingsForm
        mision={settings?.mision ?? ""}
        vision={settings?.vision ?? ""}
      />
      <TeachersManager teachers={teacherRows} />
    </div>
  );
}
