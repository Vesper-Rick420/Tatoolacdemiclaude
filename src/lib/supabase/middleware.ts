import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rutas que requieren sesión iniciada. */
const PROTECTED_PREFIXES = ["/admin", "/dashboard"];

/**
 * Refresca la sesión de Supabase en cada petición y protege las
 * rutas privadas. Se invoca desde src/middleware.ts.
 *
 * Nota: el middleware solo comprueba SI hay sesión. La validación
 * de ROL (admin/estudiante) se hace en los layouts protegidos,
 * porque ahí sí podemos consultar la base de datos con Prisma.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getUser() revalida el token contra Supabase y
  // refresca la sesión si hace falta. No quitar esta línea.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  // Sin sesión + ruta protegida → redirigir al login.
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
