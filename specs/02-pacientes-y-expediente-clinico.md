# SPEC 02 — Pacientes y expediente clínico

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-08-18
> **Objetivo:** Construir el listado de pacientes con búsqueda y filtros, y la ficha de expediente con resumen clínico e historial de sesiones editable.

## Por qué existe esta spec

La SPEC 01 dejó la agenda del día leyendo de base de datos, pero cada cita es un callejón sin salida: el botón «Abrir ficha» no lleva a ninguna parte. Esta spec construye el destino de ese botón y convierte la aplicación en algo que el terapeuta puede usar en consulta, no solo mirar.

También cierra un hueco del esquema. La SPEC 01 modeló `Patient` con lo mínimo para pintar una lista de citas (nombre, edad, nº de expediente, dirección). Un expediente clínico necesita diagnóstico, contacto y tratamiento previsto. Esos campos se añaden aquí de forma aditiva, sin renombrar ni eliminar nada de lo que la SPEC 01 ya sembró.

## Scope

**In:**

- Ruta `/app/pacientes`: listado con buscador por nombre y nº de expediente, filtros `Activos` / `Domicilio` / `Alta`, y las dos agrupaciones del mockup (`REQUIEREN SEGUIMIENTO` y `TODOS · A-Z`).
- Alta y edición de paciente mediante formulario, mediante Server Actions.
- Migración aditiva del modelo `Patient`: enum `PatientStatus` y los campos `diagnosis`, `phone`, `contactEmail`, `plannedSessions`, `notes`, `startedAt`.
- Ruta `/app/pacientes/[id]`: ficha de expediente con un shell de **cinco pestañas** (`Resumen`, `Sesiones`, `Síntomas`, `Rutina`, `Citas`), de las cuales solo `Resumen` y `Sesiones` traen contenido real en esta spec.
- Pestaña `Resumen`: los tres `StatTile` del mockup (Dolor, Sesión, Rutina), la tarjeta de alerta activa, el gráfico «Evolución del dolor» y la nota de la última sesión.
- Pestaña `Sesiones`: historial cronológico, alta de sesión nueva (fecha, número, dolor 0–10, rotación, nota) y edición de la nota de una sesión existente.
- Helper `src/lib/adherence.ts` que calcula el porcentaje de adherencia a partir de `RoutineLog` sobre los `RoutineItem` esperados.
- Ampliación de `prisma/seed.ts` con los datos que estas pantallas necesitan: campos clínicos de los 7 pacientes, sesiones históricas con `painScore`, rutinas con registros y al menos un paciente en estado `DISCHARGED`.
- Enlazado de la agenda de la SPEC 01: «Abrir ficha» y el nombre del paciente navegan a `/app/pacientes/[id]`.

**Out of scope (para specs futuras):**

- Mapa corporal interactivo y registro de marcas de síntomas — SPEC 04. La pestaña `Síntomas` queda con `EmptyState`.
- Gestión de rutinas de ejercicios y su asignación — SPEC 04. La pestaña `Rutina` queda con `EmptyState`.
- Listado y alta de citas del paciente — SPEC 03. La pestaña `Citas` queda con `EmptyState`.
- Bandeja de alertas accionable — SPEC 05. En esta spec la tarjeta de alerta es de solo lectura y su enlace «Ver el mapa →» queda inactivo.
- Búsqueda por zona anatómica: depende de `SymptomMark.zone`, que solo se llena en la SPEC 04.
- Borrado de pacientes, archivado e historial de cambios.
- Subida de documentos o imágenes al expediente.

## Modelo de datos

Esta spec **no crea tablas nuevas**. Extiende `Patient` de forma aditiva, respetando la regla de la SPEC 01: las specs 02–05 pueden añadir columnas, nunca renombrar ni eliminar las ya sembradas.

```prisma
enum PatientStatus {
  ACTIVE
  DISCHARGED
}

model Patient {
  // ...campos existentes de la SPEC 01, sin cambios...

  status          PatientStatus @default(ACTIVE)
  diagnosis       String?
  phone           String?
  contactEmail    String?
  plannedSessions Int?
  notes           String?
  startedAt       DateTime?
}
```

Convenciones:

- `status` solo distingue `ACTIVE` de `DISCHARGED`. **«Domicilio» no es un estado**: es un filtro derivado de si el paciente tiene alguna `Appointment` con `location = HOME`.
- `Patient.plannedSessions` pasa a ser la fuente de verdad del total de sesiones del tratamiento. `Session.totalPlanned` se mantiene por compatibilidad con la SPEC 01, pero la interfaz de esta spec lee siempre de `Patient.plannedSessions`.
- `Patient.diagnosis` es el texto que encabeza la ficha (`"Cervicalgia postural"`). `Appointment.reasonLabel` sigue siendo el motivo de una cita concreta y no se toca.
- Toda query de pacientes filtra por `therapistId`, igual que en la SPEC 01. Una ficha a la que se llegue con un `id` de otro terapeuta devuelve 404, no un error de permisos.
- Las fechas se siguen formateando exclusivamente con `src/lib/datetime.ts`.

## Plan de implementación

1. Añadir el enum `PatientStatus` y los seis campos nuevos a `Patient` en `prisma/schema.prisma`. Correr `npx prisma migrate dev --name patient-clinical-fields`.
2. Ampliar `prisma/seed.ts`: rellenar los campos clínicos de los 7 pacientes, marcar a Marta Sanz como `DISCHARGED` y dar a Carmen Ruiz una cita `HOME` (ya existe de la SPEC 01) para que los tres filtros tengan resultados.
3. Ampliar `prisma/seed.ts` con el historial que alimenta la ficha: 4 sesiones de Lucía Ferrer con `painScore` 6, 4, 5 y 7, y sesiones para el resto de pacientes activos.
4. Ampliar `prisma/seed.ts` con una `Routine` y sus `RoutineItem` y `RoutineLog` para Lucía Ferrer y Javier Ortega, de forma que la adherencia dé un porcentaje distinto de cero.
5. Crear `src/lib/patients.ts` con `listPatients(therapistId, { query, filter })` y `getPatientById(therapistId, id)`, ambas filtrando siempre por terapeuta.
6. Crear `src/lib/adherence.ts` con `calculateAdherence(routine)`, que devuelve el porcentaje de `RoutineLog` registrados sobre los esperados.
7. Construir `/app/pacientes`: buscador, los tres filtros, las dos agrupaciones y la fila de paciente con avatar, nombre, diagnóstico, puntuación de dolor con su flecha de tendencia y próxima cita.
8. Construir el formulario de alta y edición de paciente con Server Actions y validación en servidor, accesible desde el botón flotante `+` del listado y desde el menú `···` de la ficha.
9. Construir el shell de `/app/pacientes/[id]`: cabecera con avatar, nombre, edad y nº de expediente, y la barra de cinco pestañas con `EmptyState` en `Síntomas`, `Rutina` y `Citas`.
10. Construir la pestaña `Resumen`: los tres `StatTile`, la tarjeta de alerta activa, el gráfico de evolución del dolor y la nota de la última sesión.
11. Construir la pestaña `Sesiones`: historial cronológico, formulario de sesión nueva y edición de la nota de una sesión existente.
12. Enlazar la agenda de la SPEC 01 con la ficha: «Abrir ficha» y el nombre del paciente navegan a `/app/pacientes/[id]`.

## Acceptance criteria

- [ ] `npm run typecheck` y `npm run lint` terminan sin errores.
- [ ] `npx prisma migrate reset` recrea la base y siembra sin fallar, incluidos los campos clínicos nuevos.
- [ ] `/app/pacientes` lista los pacientes del terapeuta autenticado agrupados en `REQUIEREN SEGUIMIENTO` y `TODOS · A-Z`.
- [ ] Escribir «ferr» en el buscador deja visible a Lucía Ferrer y oculta a Andrés Molina.
- [ ] Buscar por el nº de expediente de un paciente lo encuentra.
- [ ] El filtro `Domicilio` deja visible a Carmen Ruiz, que tiene una cita con `location = HOME`.
- [ ] El filtro `Alta` deja visible a Marta Sanz y oculta a los pacientes `ACTIVE`.
- [ ] El botón `+` abre el formulario, y guardar un paciente nuevo lo hace aparecer en el listado sin recargar a mano.
- [ ] Editar el diagnóstico de un paciente y guardar refleja el texto nuevo en la cabecera de su ficha.
- [ ] Abrir `/app/pacientes/[id]` con el `id` de un paciente de otro terapeuta devuelve 404.
- [ ] La ficha muestra cinco pestañas y las de `Síntomas`, `Rutina` y `Citas` renderizan un `EmptyState`, no una página en blanco.
- [ ] En la ficha de Lucía Ferrer, el `StatTile` de dolor muestra `7` y el de sesión muestra `4/8`.
- [ ] El gráfico «Evolución del dolor» pinta una barra por sesión con `painScore`, en orden cronológico, y destaca la última.
- [ ] El `StatTile` de rutina muestra un porcentaje calculado de `RoutineLog`, no un valor escrito a mano.
- [ ] Registrar una sesión nueva la añade al historial y actualiza el `StatTile` de sesión.
- [ ] Editar la nota de una sesión existente y recargar la página conserva el texto nuevo.
- [ ] Desde `/app/agenda`, pulsar «Abrir ficha» en la cita de las 10:00 navega a la ficha de Lucía Ferrer.
- [ ] A 390px de ancho el listado y la ficha se ven sin scroll horizontal.
- [ ] A 1024px de ancho la ficha aprovecha el ancho extra en dos columnas, como en `assets/tablet_expediente_mando_dos_manos.png`.

## Decisiones

- **Sí:** shell de cinco pestañas con tres vacías desde esta spec. Las specs 03 y 04 solo rellenan su pestaña, sin tocar el componente de navegación del expediente. Un `EmptyState` honesto es mejor que refactorizar la navegación tres veces.
- **Sí:** crear y editar sesiones en esta spec. Sin escritura, el expediente sería un visor de datos sembrados y no serviría en consulta real. Las marcas corporales de esa sesión siguen siendo SPEC 04.
- **Sí:** enum `PatientStatus` con solo `ACTIVE` y `DISCHARGED`. Se consideró un `dischargedAt DateTime?` en su lugar; el enum se lee mejor en las queries de filtrado y la fecha de alta se puede añadir después si la SPEC 05 la necesita para «altas previstas».
- **No:** modelar «Domicilio» como estado del paciente. Un paciente puede tener citas en consulta y a domicilio en la misma semana; es una propiedad de la cita, no de la persona. El filtro se deriva de `Appointment.location`.
- **Sí:** `Session.painScore` como fuente del gráfico de evolución. Es el dato que el terapeuta introduce en esta misma spec. `PainLog` lo alimenta el paciente desde el portal, que es SPEC 05.
- **Sí:** calcular la adherencia de verdad desde el primer día, alimentada por rutinas sembradas. Se descartó ocultar el `StatTile` hasta la SPEC 04 porque dejaría la ficha visualmente incompleta y obligaría a retocar el layout después.
- **No:** búsqueda por zona anatómica, pese a que el mockup dice «Buscar por nombre o zona». Depende de `SymptomMark`, que no se llena hasta la SPEC 04. El placeholder del buscador se ajusta a «Buscar por nombre o nº de expediente».
- **Sí:** `Patient.plannedSessions` como fuente de verdad del total del tratamiento. Tenerlo repetido en cada `Session.totalPlanned` permite que dos sesiones del mismo paciente se contradigan.
- **No:** borrado de pacientes. Un expediente clínico no se borra; si hace falta, se archiva. Se define en su propia spec si llega a hacer falta.
- **No:** tests automatizados. Se mantiene la decisión de la SPEC 01; la verificación es manual contra los criterios de aceptación.

## Risks

| Riesgo | Mitigación |
|---|---|
| La migración aditiva rompe el seed de la SPEC 01 | Todos los campos nuevos son opcionales o tienen valor por defecto (`status` por defecto `ACTIVE`), así que las filas existentes siguen siendo válidas sin tocarlas. |
| `Patient.plannedSessions` y `Session.totalPlanned` se contradicen | La interfaz de esta spec lee siempre de `Patient.plannedSessions`. `Session.totalPlanned` queda como campo heredado y una spec futura puede retirarlo. |
| El filtro `Domicilio` obliga a un join contra `Appointment` en cada carga del listado | Con un solo terapeuta y decenas de pacientes el coste es irrelevante. Si crece, se materializa en un campo derivado. |
| La ficha filtra por `id` pero no por terapeuta y expone datos de otra consulta | `getPatientById` recibe siempre el `therapistId` de la sesión y hay un criterio de aceptación explícito que verifica el 404. |
| El gráfico de dolor queda vacío para pacientes sin sesiones | La pestaña `Resumen` usa `EmptyState` cuando el paciente no tiene sesiones registradas, en vez de pintar un gráfico sin barras. |

## Lo que **no** entra en esta spec

- Mapa corporal interactivo y marcas de síntomas (SPEC 04).
- Gestión de rutinas de ejercicios (SPEC 04).
- Listado y alta de citas del paciente (SPEC 03).
- Bandeja de alertas accionable y recordatorios operables (SPEC 05).
- Portal del paciente (SPEC 05).
- Búsqueda por zona anatómica, borrado de pacientes, subida de documentos.

Cada uno de estos, cuando le toque, se define en su propia spec.
