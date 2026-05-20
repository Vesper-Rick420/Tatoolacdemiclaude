import { z } from "zod";

/** Esquema de validación para crear un usuario desde el panel admin. */
export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(120, "Nombre demasiado largo"),
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Solo letras, números, punto y guion bajo",
    ),
  email: z.email("Correo electrónico no válido"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(72, "Máximo 72 caracteres"),
  role: z.enum(["admin", "estudiante"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
