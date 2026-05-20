import { z } from "zod";

/** Validación de un módulo. */
export const moduleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(120, "Título demasiado largo"),
});
export type ModuleInput = z.infer<typeof moduleSchema>;

/** Validación de una lección. */
export const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(160, "Título demasiado largo"),
  description: z.string().trim().max(1000, "Descripción demasiado larga"),
  isFree: z.boolean(),
});
export type LessonInput = z.infer<typeof lessonSchema>;
