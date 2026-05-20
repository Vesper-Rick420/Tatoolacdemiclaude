import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convierte un texto en un "slug" apto para URLs:
 * minúsculas, sin acentos, con guiones.  "Línea Básica" → "linea-basica"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // elimina los acentos
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico → guion
    .replace(/^-+|-+$/g, ""); // sin guiones al inicio/fin
}
