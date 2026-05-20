import { z } from "zod";

/** Esquema de validación del formulario de inicio de sesión. */
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Ingresa tu usuario o correo electrónico")
    .max(255),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;
