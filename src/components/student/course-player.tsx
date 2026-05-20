"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/student/video-player";

type PlayerLesson = {
  id: string;
  title: string;
  isFree: boolean;
  hasVideo: boolean;
  accessible: boolean;
};

type PlayerModule = {
  id: string;
  title: string;
  lessons: PlayerLesson[];
};

export function CoursePlayer({
  courseId,
  courseTitle,
  modules,
  currentLessonId,
  currentTitle,
  currentDescription,
  signedUrl,
  resumeAt,
  completedLessonIds,
}: {
  courseId: string;
  courseTitle: string;
  modules: PlayerModule[];
  currentLessonId: string;
  currentTitle: string;
  currentDescription: string | null;
  signedUrl: string | null;
  resumeAt: number;
  completedLessonIds: string[];
}) {
  // Set local de lecciones completadas (se actualiza al terminar un video,
  // sin recargar la página).
  const [completed, setCompleted] = useState(
    () => new Set(completedLessonIds),
  );

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div>
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis cursos
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{courseTitle}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Reproductor */}
        <div className="space-y-4">
          {signedUrl ? (
            <VideoPlayer
              key={currentLessonId}
              src={signedUrl}
              lessonId={currentLessonId}
              resumeAt={resumeAt}
              onCompleted={() =>
                setCompleted((prev) => new Set(prev).add(currentLessonId))
              }
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-card text-center text-sm text-muted-foreground">
              Este video aún no está disponible.
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{currentTitle}</h2>
            {currentDescription && (
              <p className="mt-1 text-sm text-muted-foreground">
                {currentDescription}
              </p>
            )}
          </div>
        </div>

        {/* Contenido del curso */}
        <aside className="space-y-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Contenido del curso</p>
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="space-y-1">
                <p className="px-1 text-xs font-medium text-muted-foreground uppercase">
                  {module.title}
                </p>
                {module.lessons.map((lesson) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isDone = completed.has(lesson.id);

                  if (!lesson.accessible) {
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground/70"
                      >
                        <Lock className="h-4 w-4 shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/cursos/${courseId}?l=${lesson.id}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        isCurrent
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : isCurrent ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
