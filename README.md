# 🖤 Tatool Academy

Plataforma web premium de **cursos de tatuaje online**, estilo Netflix/Udemy.
Los administradores gestionan usuarios y cursos; los estudiantes ven clases por
niveles y descargan recursos con marca de agua personalizada.

---

## 🧱 Stack tecnológico

| Capa            | Tecnología                                            |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 15 (App Router) + TypeScript                  |
| Estilos / UI    | TailwindCSS v4 + shadcn/ui + Framer Motion            |
| Backend / DB    | Supabase (PostgreSQL + Auth + Storage)                |
| ORM             | Prisma 7                                              |
| Estado servidor | TanStack Query                                        |
| Formularios     | React Hook Form + Zod                                 |
| Hosting         | Vercel                                                |

## 🎨 Diseño

Minimalista y premium. Paleta **blanco / negro / morado pastel**, dark mode,
sidebar moderna, cards animadas y diseño totalmente responsive.

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/        → autenticación (sin sidebar)
│   ├── (student)/dashboard/ → panel del estudiante
│   ├── (admin)/admin/       → panel del administrador
│   └── api/                 → API routes
├── components/
│   ├── ui/                  → componentes shadcn/ui
│   ├── layout/              → sidebar, navbar, etc.
│   ├── student/  admin/  shared/
├── lib/
│   ├── supabase/            → clientes de Supabase
│   └── validations/         → esquemas Zod
├── hooks/  types/
prisma/                      → schema.prisma (modelo de datos)
supabase/migrations/         → SQL de RLS, triggers y políticas
```

## 🚀 Puesta en marcha

```bash
npm install          # instalar dependencias
cp .env.example .env # crear variables de entorno y rellenarlas
npm run dev          # arrancar en http://localhost:3000
```

## 📜 Scripts

| Comando         | Descripción                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Servidor de desarrollo (Turbopack)   |
| `npm run build` | Build de producción                  |
| `npm run start` | Servir el build de producción        |
| `npm run lint`  | Linter (ESLint)                      |

## 🗺️ Roadmap por fases

- [x] **Fase 1** — Inicialización: proyecto, estructura, dependencias, Git
- [ ] **Fase 2** — Supabase: base de datos, schema Prisma, RLS
- [ ] **Fase 3** — Autenticación, middleware y roles
- [ ] **Fase 4** — Panel de administración
- [ ] **Fase 5** — Panel del estudiante
- [ ] **Fase 6** — Sistema de cursos y reproductor de video
- [ ] **Fase 7** — Descargas con marca de agua (FFmpeg) y logs
- [ ] **Fase 8** — Hardening de seguridad y despliegue en Vercel
