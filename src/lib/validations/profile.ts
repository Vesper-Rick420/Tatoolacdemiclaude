import { z } from "zod";

/** Validación de la edición del propio perfil. */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(120, "Nombre demasiado largo"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
