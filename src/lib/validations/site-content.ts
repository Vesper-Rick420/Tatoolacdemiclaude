import { z } from "zod";

/** Validación de la misión y visión de la página de inicio. */
export const siteSettingsSchema = z.object({
  mision: z
    .string()
    .trim()
    .min(10, "La misión es demasiado corta")
    .max(800, "La misión es demasiado larga"),
  vision: z
    .string()
    .trim()
    .min(10, "La visión es demasiado corta")
    .max(800, "La visión es demasiado larga"),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

/** Validación de un profesor. */
export const teacherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(120, "Nombre demasiado largo"),
  specialty: z
    .string()
    .trim()
    .min(2, "La especialidad es obligatoria")
    .max(120, "Especialidad demasiado larga"),
  instagramUrl: z.string().trim().max(300, "Enlace demasiado largo"),
  facebookUrl: z.string().trim().max(300, "Enlace demasiado largo"),
});
export type TeacherInput = z.infer<typeof teacherSchema>;
