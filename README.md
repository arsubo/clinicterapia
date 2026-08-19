# ClinicTerapia

Software de gestión para consultas de fisioterapia. Centraliza en un solo sitio la agenda del día, el expediente clínico de cada paciente, el registro de dolor y síntomas por sesión, las rutinas de ejercicios en casa y las alertas que requieren atención del terapeuta — con un portal aparte donde cada paciente ve su propia rutina.

Es un producto genérico, pensado para cualquier terapeuta o clínica, no una app hecha a medida para una consulta en particular. Los datos de ejemplo del seed (el terapeuta César Fonseca y sus pacientes) son solo el set de datos de desarrollo usado para construir y probar el MVP — no representan la identidad del producto.

## Estado del proyecto

El proyecto se construye spec por spec siguiendo el roadmap en [`specs/00-roadmap.md`](specs/00-roadmap.md). Cada spec en `specs/` define el objetivo, el alcance y los criterios de aceptación de una parte del MVP antes de implementarla.

**SPEC 01 — Fundación, design system y acceso** ([`specs/01-fundacion-design-system-y-acceso.md`](specs/01-fundacion-design-system-y-acceso.md)) está **Implementada**: el proyecto Next.js base, el design system, el esquema de datos completo, el acceso por email/contraseña, la navegación (`AppShell`) y la Agenda del día con datos reales.

**SPEC 02 — Pacientes y expediente clínico** ([`specs/02-pacientes-y-expediente-clinico.md`](specs/02-pacientes-y-expediente-clinico.md)) tiene su plan de implementación completo (rama `spec-02-pacientes-y-expediente-clinico`): listado de pacientes con búsqueda y filtros, alta/edición de paciente, y la ficha de expediente con las pestañas `Resumen` y `Sesiones` funcionales (`Síntomas`, `Rutina` y `Citas` quedan con un `EmptyState` para las specs 03 y 04).

Las siguientes specs (`03` en adelante) todavía no están implementadas — ver [`specs/00-roadmap.md`](specs/00-roadmap.md).

### Rutas principales

| Ruta | Descripción | Acceso |
|---|---|---|
| `/acceso` | Login por email/contraseña | Público |
| `/app/agenda` | Agenda del día (citas, StatTiles, alertas, visita a domicilio) | `THERAPIST` |
| `/app/pacientes` | Listado de pacientes: búsqueda, filtros (`Activos`/`Domicilio`/`Alta`) y agrupaciones | `THERAPIST` |
| `/app/pacientes/nuevo` | Alta de paciente | `THERAPIST` |
| `/app/pacientes/[id]` | Ficha del paciente — pestaña `Resumen` (StatTiles, alerta activa, evolución del dolor) | `THERAPIST` |
| `/app/pacientes/[id]/sesiones` | Historial de sesiones, alta de sesión y edición de nota | `THERAPIST` |
| `/app/pacientes/[id]/{sintomas,rutina,citas}` | Pestañas reservadas para las specs 03 y 04 (`EmptyState`) | `THERAPIST` |
| `/app/pacientes/[id]/editar` | Edición de paciente | `THERAPIST` |
| `/design` | Catálogo visual de tokens y primitivas UI | Público |

`/portal/*` (portal del paciente) está reservado en el esquema de rutas y protegido por `middleware.ts`, pero su contenido se implementa en una spec futura.

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

### Datos de prueba

El seed (`prisma/seed.ts`) crea un terapeuta y 7 pacientes, todos con la misma contraseña por rol:

| Usuario | Email | Contraseña |
|---|---|---|
| Terapeuta (César Fonseca) | `cesar@pauta.clinic` | `clinicterapia123` |
| Pacientes (Andrés, Marta, Lucía, Javier, Nuria, Tomás, Carmen) | `{nombre}@pauta.clinic` | `paciente123` |

Solo `THERAPIST` tiene acceso funcional en esta spec (`/app/*`); el login de paciente existe pero su portal (`/portal/*`) aún no está implementado.

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

## Autoría

Software propiedad de **Arnoldo Suárez — Dev&Arch**.
