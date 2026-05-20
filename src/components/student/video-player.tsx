"use client";

import { useRef, useState } from "react";

/**
 * Reproductor de video de una lección.
 *  - Reanuda desde el último segundo visto (resumeAt).
 *  - Guarda el progreso cada ~15 s y al pausar/terminar.
 *  - Marca la lección completada al llegar al 95 %.
 *
 * El guardado va a /api/progress vía fetch (no recarga la página).
 */
export function VideoPlayer({
  src,
  lessonId,
  resumeAt,
  onCompleted,
}: {
  src: string;
  lessonId: string;
  resumeAt: number;
  onCompleted: () => void;
}) {
  // Congelamos la URL firmada: aunque el padre se re-renderice,
  // el <video> no recibe un src nuevo y no se reinicia.
  const [videoSrc] = useState(src);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedAt = useRef(0);
  const completedSent = useRef(false);

  function postProgress(position: number, completed: boolean) {
    void fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        position: Math.floor(position),
        completed,
      }),
    });
  }

  function markCompleted(position: number) {
    if (completedSent.current) return;
    completedSent.current = true;
    postProgress(position, true);
    onCompleted();
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;

    // Guardado periódico cada 15 s de reproducción.
    if (video.currentTime - lastSavedAt.current >= 15) {
      lastSavedAt.current = video.currentTime;
      postProgress(video.currentTime, false);
    }

    // Completada al alcanzar el 95 %.
    if (video.duration > 0 && video.currentTime / video.duration >= 0.95) {
      markCompleted(video.currentTime);
    }
  }

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
      onLoadedMetadata={() => {
        const video = videoRef.current;
        if (video && resumeAt > 0 && resumeAt < video.duration) {
          video.currentTime = resumeAt;
        }
      }}
      onTimeUpdate={handleTimeUpdate}
      onPause={() => {
        const video = videoRef.current;
        if (video) postProgress(video.currentTime, completedSent.current);
      }}
      onEnded={() => {
        const video = videoRef.current;
        if (video) markCompleted(video.duration);
      }}
      className="aspect-video w-full rounded-xl bg-black"
    />
  );
}
