/**
 * Constantes globales de Tatool Academy.
 * Centralizar los valores fijos evita "magic strings" repartidos por el código
 * y da un único sitio donde mantenerlos.
 */

export const APP_NAME = "Tatool Academy";
export const APP_DESCRIPTION =
  "Plataforma premium de cursos de tatuaje online — del nivel básico al profesional.";

/** Roles de usuario. Deben coincidir con el enum de la base de datos (Fase 2). */
export const USER_ROLES = {
  ADMIN: "admin",
  STUDENT: "estudiante",
} as const;
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Niveles de los cursos, en orden de progresión. */
export const COURSE_LEVELS = [
  "basico",
  "intermedio",
  "avanzado",
  "profesional",
] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

/** Etiquetas legibles para mostrar en la interfaz. */
export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  profesional: "Profesional",
};

/** Orden numérico de cada nivel — clave para la lógica de bloqueo/desbloqueo. */
export const COURSE_LEVEL_ORDER: Record<CourseLevel, number> = {
  basico: 1,
  intermedio: 2,
  avanzado: 3,
  profesional: 4,
};

/** Rutas principales de la aplicación. */
export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  admin: "/admin",
} as const;

/** Buckets de Supabase Storage (se crean en la Fase 2). */
export const STORAGE_BUCKETS = {
  videos: "course-videos",
  resources: "course-resources",
  avatars: "avatars",
} as const;
