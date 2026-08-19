# SPEC 01 — Fundación, design system y acceso

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-08-18
> **Objetivo:** Levantar el proyecto Next.js de ClinicTerapia con su design system, su esquema de datos completo, el acceso por email/password y la Agenda del día funcional con datos reales.

## Por qué existe esta spec

Es la spec cimiento del MVP. Fija los tokens visuales extraídos de los mockups, el esquema Prisma completo (aunque varias tablas solo las usarán specs posteriores) y el shell de navegación responsive. Si esto no queda cerrado aquí, cada spec siguiente (02–05) tendría que reinventar estilos o migrar el esquema de datos, lo que es más costoso que sobredimensionar el modelo desde el día uno.

## Scope

**In:**

- Proyecto Next.js 15 (App Router, TypeScript, Tailwind CSS v4) con `npm` como gestor de paquetes.
- Design system: tokens de color en CSS, tres familias tipográficas vía `next/font/google`, y primitivas UI reutilizables (`Card`, `StatTile`, `StatusPill`, `Button`, `Eyebrow`, `Avatar`, `SectionHeader`, `EmptyState`).
- Ruta temporal `/design` que renderiza todas las primitivas y tokens para comparar visualmente contra los mockups de `assets/`.
- Prisma ORM + Postgres (Neon) con el **esquema de datos completo del MVP**, incluidas tablas que las specs 02–05 usarán más adelante.
- `prisma/seed.ts` reproducible con el terapeuta y los 7 pacientes / 7 citas que aparecen en los mockups (Andrés Molina, Marta Sanz, Lucía Ferrer, Javier Ortega, Nuria Beltrán, Tomás Iglesias, Carmen Ruiz).
- Autenticación con Auth.js v5, proveedor de credenciales (email + contraseña con `bcrypt`), sesión JWT, roles `THERAPIST` y `PATIENT`.
- `middleware.ts` que protege `/app/*` (solo `THERAPIST`) y `/portal/*` (solo `PATIENT`), redirigiendo a `/acceso` sin sesión.
- Pantalla `/acceso` fiel a `assets/celular_acceso.png` (sin el botón "Entrar con Face ID", ver Decisiones).
- `AppShell`: navegación responsive con tab bar inferior de 5 ítems en móvil (`<768px`) y rail lateral en tablet/escritorio (`≥768px`), fiel a `assets/celular_agenda_dia.png` y `assets/tablet_agenda_linea_tiempo.png`.
- `/app/agenda`: Dashboard/Agenda del día que lee de la base de datos, con las variantes móvil (`assets/celular_agenda_dia.png`) y tablet (`assets/tablet_dashboard_main.png`), incluidos los `StatTile`s, la lista de citas del día y el panel lateral "Requiere atención" / "Visita a domicilio" en tablet.
- Menú de sesión con cierre de sesión.
- Scripts `npm run typecheck` y `npm run lint` configurados y en verde.

**Out of scope (para specs futuras):**

- Listado completo de pacientes, búsqueda y ficha de expediente con pestañas — SPEC 02.
- Calendario en vista semana/mes y flujo de agendar/editar cita — SPEC 03.
- Diagrama de síntomas interactivo (mapa corporal clicable) y gestión de rutinas — SPEC 04.
- Bandeja de alertas accionable, recordatorios simulados y portal del paciente — SPEC 05.
- Integración real con Twilio (SMS, WhatsApp, Verify, voz): queda completamente fuera del MVP.
- Face ID / WebAuthn, subida de documentos/archivos, facturación, modo offline / PWA.

## Modelo de datos

Este feature introduce el esquema de datos completo del MVP en `prisma/schema.prisma`. Las specs 02–05 solo lo extienden con campos adicionales si hiciera falta; no lo migran de forma incompatible.

```prisma
enum Role {
  THERAPIST
  PATIENT
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  UNCONFIRMED
  DONE
  CANCELLED
  NO_SHOW
}

enum AppointmentLocation {
  CLINIC
  HOME
}

enum BodyView {
  FRONT
  BACK
}

enum PainType {
  SHARP
  TENSION
  DULL
  RADIATING
}

enum ReminderChannel {
  WHATSAPP
  SMS
  IN_APP
  EMAIL
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
}

enum AlertType {
  UNCONFIRMED_APPOINTMENT
  ROUTINE_NO_LOG
  PAIN_INCREASE
  DISCHARGE_DUE
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role
  therapist    Therapist?
  patient      Patient?
  createdAt    DateTime @default(now())
}

model Therapist {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  fullName     String
  licenseNo    String
  patients     Patient[]
  appointments Appointment[]
}

model Patient {
  id            String   @id @default(cuid())
  therapistId   String
  therapist     Therapist @relation(fields: [therapistId], references: [id])
  userId        String?   @unique
  user          User?     @relation(fields: [userId], references: [id])
  fullName      String
  age           Int?
  recordNo      String
  homeAddress   String?
  appointments  Appointment[]
  sessions      Session[]
  symptomMarks  SymptomMark[]
  routines      Routine[]
  painLogs      PainLog[]
  alerts        Alert[]
}

model Appointment {
  id           String   @id @default(cuid())
  therapistId  String
  therapist    Therapist @relation(fields: [therapistId], references: [id])
  patientId    String
  patient      Patient  @relation(fields: [patientId], references: [id])
  startsAt     DateTime
  durationMin  Int      @default(45)
  status       AppointmentStatus @default(SCHEDULED)
  location     AppointmentLocation @default(CLINIC)
  address      String?
  travelMin    Int?
  reasonLabel  String
}

model Session {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  occurredAt  DateTime
  sequenceNo  Int
  totalPlanned Int
  painScore   Int?
  rotationDeg Int?
  note        String?
}

model SymptomMark {
  id         String   @id @default(cuid())
  patientId  String
  patient    Patient  @relation(fields: [patientId], references: [id])
  sessionId  String?
  view       BodyView
  x          Float
  y          Float
  zone       String
  intensity  Int
  painType   PainType
  createdAt  DateTime @default(now())
}

model Exercise {
  id          String   @id @default(cuid())
  name        String
  description String?
  videoUrl    String?
  routineItems RoutineItem[]
}

model Routine {
  id         String   @id @default(cuid())
  patientId  String
  patient    Patient  @relation(fields: [patientId], references: [id])
  weekLabel  String
  items      RoutineItem[]
  logs       RoutineLog[]
}

model RoutineItem {
  id          String   @id @default(cuid())
  routineId   String
  routine     Routine  @relation(fields: [routineId], references: [id])
  exerciseId  String
  exercise    Exercise @relation(fields: [exerciseId], references: [id])
  prescription String
  order       Int
}

model RoutineLog {
  id            String   @id @default(cuid())
  routineId     String
  routine       Routine  @relation(fields: [routineId], references: [id])
  routineItemId String
  loggedAt      DateTime @default(now())
}

model PainLog {
  id         String   @id @default(cuid())
  patientId  String
  patient    Patient  @relation(fields: [patientId], references: [id])
  score      Int
  zone       String?
  loggedAt   DateTime @default(now())
}

model Alert {
  id         String    @id @default(cuid())
  therapistId String
  patientId  String
  patient    Patient   @relation(fields: [patientId], references: [id])
  type       AlertType
  message    String
  resolvedAt DateTime?
  createdAt  DateTime  @default(now())
}

model Reminder {
  id         String          @id @default(cuid())
  patientId  String
  channel    ReminderChannel
  status     ReminderStatus  @default(PENDING)
  message    String
  scheduledFor DateTime
  sentAt     DateTime?
}
```

Convenciones:

- Todo dato clínico cuelga de `therapistId` (directo o vía `patient.therapistId`); ninguna query de la app puede omitir ese filtro.
- Fechas se guardan en UTC en la base de datos. El render en pantalla pasa siempre por un único helper `src/lib/datetime.ts` que fija la zona `America/Managua`.
- `SymptomMark.x` / `SymptomMark.y` son coordenadas normalizadas (0–1) relativas al SVG del cuerpo; `zone` es la etiqueta legible (`"Cervical derecha"`) derivada del path SVG bajo el punto tocado.
- `Reminder` y `Alert` se persisten y se muestran en la interfaz, pero ningún proceso los envía por un canal real (ver Decisiones).

## Plan de implementación

1. Scaffold del proyecto: Next.js 15 + TypeScript + Tailwind CSS v4 + ESLint, con scripts `dev`, `build`, `typecheck`, `lint` en `package.json`.
2. Crear `src/app/globals.css` con los tokens de color (`--ct-bg-page`, `--ct-surface`, `--ct-surface-soft`, `--ct-rail-dark`, `--ct-primary`, `--ct-primary-deep`, `--ct-primary-soft`, `--ct-ink`, `--ct-ink-muted`, `--ct-border`, `--ct-warn`) y cargar las tres fuentes (Outfit, Inter, IBM Plex Mono) vía `next/font/google`. Crear la ruta `/design` que los pinta en una página simple.
3. Construir las primitivas UI en `src/components/ui/` (`Card`, `StatTile`, `StatusPill`, `Button`, `Eyebrow`, `Avatar`, `SectionHeader`, `EmptyState`) y añadirlas a `/design` para verificación visual contra los mockups antes de continuar.
4. Configurar Prisma con `DATABASE_URL` apuntando a un proyecto Neon, escribir el `schema.prisma` completo de la sección anterior y correr la primera migración.
5. Escribir `prisma/seed.ts`: crea el usuario/terapeuta (César Fonseca), los 7 pacientes, las 7 citas del lunes 17 de agosto, las sesiones y las marcas de síntomas de Lucía Ferrer que aparecen en los mockups.
6. Configurar Auth.js v5 con proveedor de credenciales en `src/lib/auth.ts` (hash con `bcrypt`, sesión JWT) y `middleware.ts` que protege `/app/*` (rol `THERAPIST`) y `/portal/*` (rol `PATIENT`).
7. Construir `/acceso` fiel a `assets/celular_acceso.png`: eyebrow, titular en Outfit, campos de correo/contraseña, CTA de borde teal, enlaces "He olvidado la contraseña" y "Soy paciente y quiero ver mi rutina". Sin botón de Face ID.
8. Construir `AppShell` con la tab bar inferior de 5 ítems en móvil y el rail lateral en tablet/escritorio, ítem activo resaltado en teal y badge de alertas pendientes.
9. Construir `/app/agenda`: trae las citas del día del terapeuta autenticado, pinta los `StatTile`s (sesiones hoy, adherencia media, altas previstas, requieren atención) y la lista de citas con hora en mono, píldoras de estado y la card "ahora" destacada.
10. Añadir el panel lateral de tablet ("Requiere atención" y "Visita a domicilio") alimentado por los registros de `Alert` del seed, y el menú de sesión con cierre de sesión.

## Acceptance criteria

- [x] `npm run typecheck` y `npm run lint` terminan sin errores.
- [x] `npx prisma migrate reset` recrea la base de datos y siembra 7 pacientes y 7 citas sin fallar. _(corrido manualmente por el usuario; verificado: 7 pacientes, 7 citas, 7 rutinas, 3 alertas en la base tras el reset)_
- [x] En `/acceso`, credenciales incorrectas muestran un error en línea y no navegan.
- [x] Con las credenciales del seed del terapeuta, el login redirige a `/app/agenda`.
- [x] Visitar `/app/agenda` sin sesión iniciada redirige a `/acceso`.
- [x] Un usuario con rol `PATIENT` que intenta abrir `/app/agenda` es rechazado por el middleware.
- [x] A 390px de ancho se ve la tab bar de 5 ítems (Agenda, Pacientes, Calendario, Alertas, Ajustes) y no aparece scroll horizontal. _(verificado por DOM/CSS; no se pudo forzar el viewport del navegador automatizado a 390px en este entorno)_
- [x] A 1024px de ancho se ve el rail lateral y desaparece la tab bar inferior.
- [x] `/app/agenda` lista las 7 citas del seed en orden cronológico y resalta visualmente la de las 10:00 como "ahora".
- [x] Los estados de cita `Sin confirmar`, `Domicilio` y `Confirmada` se pintan como píldoras usando `--ct-primary-soft` de fondo y `--ct-primary-deep` de texto.
- [x] Las horas (`08:30`) y los eyebrows (`LUNES 17 DE AGOSTO`) se renderizan en IBM Plex Mono, en mayúsculas y con letter-spacing.
- [x] Con la variable de entorno `TZ` del servidor puesta en un valor distinto a `America/Managua`, las fechas mostradas en pantalla siguen correspondiendo a la hora de Managua. _(verificado por auditoría de código: todo el renderizado de fechas pasa por `formatTimeManagua`/`formatWeekdayDateManagua` con `timeZone: "America/Managua"` explícito)_

## Decisiones

- **Sí:** modelar `Reminder` y `Alert` como registros persistidos y visibles en la interfaz, sin envío real. El usuario pidió explícitamente que Twilio quede "a modo de mock" por ahora; el campo `channel` ya deja el hueco para conectar un envío real en una spec futura.
- **No:** Twilio Verify / OTP para el acceso del paciente. Sin un canal de SMS/WhatsApp real no hay forma de entregar el código; se descarta en favor de credenciales.
- **Sí:** rol `PATIENT` sobre la misma tabla `User` que `THERAPIST`. Un solo sistema de autenticación que mantener, en vez de dos flujos distintos.
- **Sí:** esquema Prisma completo en esta spec, aunque varias tablas (`Routine`, `SymptomMark`, `Alert`, etc.) no se usan todavía. Evita migraciones incompatibles entre las specs 02–05.
- **Sí:** `SymptomMark` guarda `x`/`y` normalizados **y** `zone`. El punto se dibuja donde tocó el dedo y aun así las sesiones son comparables por zona anatómica.
- **Sí:** `Exercise.videoUrl` apunta a un recurso externo (YouTube/Vimeo). Cero infraestructura de almacenamiento de vídeo en el MVP.
- **No:** Face ID / WebAuthn, aunque aparece en `assets/celular_acceso.png`. Queda fuera del alcance de un MVP.
- **Sí:** un solo terapeuta real en producción, pero con tabla `Therapist` y `therapistId` en todo el esquema desde el inicio. Migrar a multi-terapeuta después sería costoso; hacerlo así no cuesta más ahora.
- **Sí:** `America/Managua` fijo en una constante de `src/lib/datetime.ts`, no configurable por el usuario. Solo hay un terapeuta y una zona horaria en el MVP.
- **No:** tests automatizados (unitarios o E2E). Decisión explícita del usuario; la verificación de esta spec es manual contra los criterios de aceptación.

## Risks

| Riesgo | Mitigación |
|---|---|
| Las fechas se desplazan por la zona horaria del servidor (por ejemplo, Vercel corriendo en UTC) | Todo el formateo de fechas pasa por el único helper `src/lib/datetime.ts` con `America/Managua` fijo; hay un criterio de aceptación explícito que lo verifica. |
| Los tokens de color son una aproximación visual a los PNG de los mockups | El paso 2 crea `/design` antes de construir ninguna pantalla real, para comparar los tokens contra los mockups y ajustarlos temprano. |
| La rama gratuita de Neon se suspende por inactividad y el primer request falla | El cliente Prisma usa el connection pooling de Neon con reintento; en desarrollo local es válido levantar Postgres en Docker como alternativa. |
| El esquema completo definido hoy queda desalineado cuando lleguen las specs 02–05 | Las specs futuras pueden añadir columnas o tablas nuevas, pero no renombrar ni eliminar los campos ya sembrados por esta spec. |

## Lo que **no** entra en esta spec

- Listado de pacientes, búsqueda y ficha de expediente completa (SPEC 02).
- Calendario semana/mes y flujo de agendar cita (SPEC 03).
- Diagrama de síntomas interactivo y gestión de rutinas (SPEC 04).
- Bandeja de alertas accionable, recordatorios simulados operables y portal del paciente (SPEC 05).
- Integración real con Twilio, Face ID/WebAuthn, subida de documentos, facturación, PWA/modo offline.

Cada uno de estos, cuando le toque, se define en su propia spec.
