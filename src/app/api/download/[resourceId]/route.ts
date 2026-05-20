import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { watermarkPdf } from "@/lib/watermark";

// pdf-lib y Prisma requieren el runtime de Node.js.
export const runtime = "nodejs";

/**
 * GET /api/download/[resourceId]
 * Descarga un recurso. Si es PDF, le aplica una marca de agua con el
 * nombre del estudiante. Registra cada descarga en la tabla `downloads`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const { resourceId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("No autorizado.", { status: 401 });

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      lesson: {
        select: {
          isFree: true,
          module: { select: { course: { select: { levelId: true } } } },
        },
      },
    },
  });
  if (!resource) {
    return new NextResponse("Recurso no encontrado.", { status: 404 });
  }

  // Control de acceso: el nivel debe estar desbloqueado (salvo lección gratis).
  const levelId = resource.lesson.module.course.levelId;
  if (!resource.lesson.isFree) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { profileId_levelId: { profileId: user.id, levelId } },
    });
    const hasAccess =
      enrollment?.status === "activo" || enrollment?.status === "completado";
    if (!hasAccess) {
      return new NextResponse("Sin acceso a este recurso.", { status: 403 });
    }
  }

  // Descargar el archivo del bucket privado.
  const admin = createAdminClient();
  const { data: blob, error } = await admin.storage
    .from(STORAGE_BUCKETS.resources)
    .download(resource.filePath);
  if (error || !blob) {
    return new NextResponse("No se pudo obtener el archivo.", { status: 500 });
  }
  let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(
    await blob.arrayBuffer(),
  );

  // Datos del usuario para la marca de agua.
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { fullName: true, username: true, email: true },
  });
  const watermarkName = profile?.fullName || profile?.username || "Usuario";

  // Marca de agua en PDFs.
  const ext = resource.filePath.split(".").pop()?.toLowerCase() ?? "";
  let contentType = "application/octet-stream";
  if (ext === "pdf") {
    contentType = "application/pdf";
    try {
      bytes = await watermarkPdf(bytes, watermarkName, profile?.email ?? "");
    } catch {
      // Si el PDF no se puede procesar, se entrega el original.
    }
  }

  // Registrar la descarga (auditoría) — no debe bloquear la entrega.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  await prisma.download
    .create({
      data: {
        profileId: user.id,
        resourceId: resource.id,
        lessonId: resource.lessonId,
        fileName: resource.name,
        fileType: resource.type,
        ipAddress: ip,
      },
    })
    .catch(() => {});
  await prisma.activityLog
    .create({
      data: { profileId: user.id, action: "download", metadata: { resourceId } },
    })
    .catch(() => {});

  const safeName = resource.name.replace(/[^\w.\-() ]/g, "_") || "recurso";

  return new NextResponse(new Blob([bytes], { type: contentType }), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}
