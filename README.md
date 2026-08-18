# ClinicTerapia

Aplicación web para la consulta de fisioterapia de César Fonseca. Centraliza en un solo sitio la agenda del día, el expediente clínico de cada paciente, el registro de dolor y síntomas por sesión, las rutinas de ejercicios en casa y las alertas que requieren atención del terapeuta — con un portal aparte donde cada paciente ve su propia rutina.

## Estado del proyecto

El proyecto se construye spec por spec siguiendo el roadmap en [`specs/00-roadmap.md`](specs/00-roadmap.md). Cada spec en `specs/` define el objetivo, el alcance y los criterios de aceptación de una parte del MVP antes de implementarla.

Esta rama implementa la **SPEC 01 — Fundación, design system y acceso**: el proyecto Next.js base, el design system, el esquema de datos completo, el acceso por email/contraseña y la Agenda del día.

## Stack técnico

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** para estilos, con tokens propios extraídos de los mockups en `assets/`
- **Prisma ORM** + **Postgres** (alojado en [Neon](https://neon.tech))
- **Auth.js v5** con proveedor de credenciales (email + contraseña) y sesión JWT
- Localización fija: `es-NI`, zona horaria `America/Managua`

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar DATABASE_URL y AUTH_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Ver [`.env.example`](.env.example) para la lista completa. El archivo `.env` con los valores reales nunca se sube al repositorio.

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Cadena de conexión a Postgres (proyecto Neon, conexión pooled) |
| `AUTH_SECRET` | Secreto de Auth.js v5 para firmar la sesión JWT. Se genera con `npx auth secret` |

## Scripts disponibles

```bash
npm run dev         # servidor de desarrollo
npm run build        # build de producción
npm run start         # sirve el build de producción
npm run lint          # ESLint
npm run typecheck     # chequeo de tipos con tsc
```
