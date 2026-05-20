import { LandingHero } from "@/components/shared/landing-hero";
import { prisma } from "@/lib/prisma";

// La landing consulta la base de datos (contenido editable): se renderiza
// en cada visita, no se pre-genera durante el build.
export const dynamic = "force-dynamic";

// Textos de respaldo por si aún no hay datos en la base de datos.
const FALLBACK_MISION =
  "En Tatool Academy formamos tatuadores profesionales con bases sólidas en técnica, bioseguridad y arte.";
const FALLBACK_VISION =
  "Ser la academia de tatuaje online líder en Latinoamérica.";

export default async function HomePage() {
  const [settings, teachers] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.teacher.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <LandingHero
      mision={settings?.mision ?? FALLBACK_MISION}
      vision={settings?.vision ?? FALLBACK_VISION}
      teachers={teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        specialty: teacher.specialty,
        photoUrl: teacher.photoUrl,
        instagramUrl: teacher.instagramUrl,
        facebookUrl: teacher.facebookUrl,
      }))}
    />
  );
}
