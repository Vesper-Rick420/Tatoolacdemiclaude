/**
 * Logo de Tatool Academy.
 * Es blanco con fondo transparente → colócalo siempre sobre un
 * fondo oscuro para que se vea correctamente.
 */
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Tatool Academy"
      className={className}
    />
  );
}
