import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CourseContent,
  type CourseDetail,
} from "@/components/admin/course-content";

export const metadata: Metadata = { title: "Contenido del curso" };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      level: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const detail: CourseDetail = {
    id: course.id,
    title: course.title,
    levelName: course.level.name,
    isPublished: course.isPublished,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        isFree: lesson.isFree,
        hasVideo: Boolean(lesson.videoPath),
      })),
    })),
  };

  return <CourseContent course={detail} />;
}
