import { z } from "zod";

/** Esquema de validación para crear/editar un curso. */
export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(120, "Título demasiado largo"),
  description: z
    .string()
    .trim()
    .max(1000, "Descripción demasiado larga"),
  levelId: z.string().min(1, "Selecciona un nivel"),
});

export type CourseInput = z.infer<typeof courseSchema>;
