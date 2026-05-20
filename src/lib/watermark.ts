import "server-only";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

/**
 * Estampa una marca de agua personalizada en TODAS las páginas de un PDF:
 *  - El nombre del usuario en diagonal, tenue, en el centro.
 *  - Un pie de página con nombre, email y fecha de descarga.
 *
 * Devuelve el PDF resultante como bytes.
 */
export async function watermarkPdf(
  input: Uint8Array,
  name: string,
  email: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const pdf = await PDFDocument.load(input, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const fecha = new Intl.DateTimeFormat("es", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  const footer = `Descargado por ${name}${
    email ? ` · ${email}` : ""
  } · ${fecha} · Tatool Academy`;

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    // Marca diagonal tenue, centrada.
    const diagText = name.toUpperCase();
    const diagSize = 42;
    const diagWidth = font.widthOfTextAtSize(diagText, diagSize);
    page.drawText(diagText, {
      x: width / 2 - diagWidth / 2.6,
      y: height / 2 - diagWidth / 2.6,
      size: diagSize,
      font,
      color: rgb(0.55, 0.45, 0.85),
      opacity: 0.13,
      rotate: degrees(45),
    });

    // Pie de página con los datos del usuario.
    page.drawText(footer, {
      x: 24,
      y: 14,
      size: 7.5,
      font,
      color: rgb(0.4, 0.4, 0.46),
      opacity: 0.85,
    });
  }

  // Copiamos a un Uint8Array con ArrayBuffer propio (compat. de tipos al
  // construir el Blob de la respuesta).
  const saved = await pdf.save();
  const output = new Uint8Array(saved.length);
  output.set(saved);
  return output;
}
