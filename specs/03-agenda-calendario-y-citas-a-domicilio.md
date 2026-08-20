# SPEC 03 — Agenda, calendario y citas a domicilio

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-08-19
> **Objetivo:** Construir el calendario en vistas día, semana y mes con alta, edición y cambio de estado de citas, incluidas las visitas a domicilio con su tiempo de viaje reservado en la agenda.

## Por qué existe esta spec

El ítem `Calendario` de la barra de navegación lleva a una ruta que no existe. La SPEC 01 sembró siete citas en la base de datos y las pinta en la agenda del día, pero nadie puede crear la octava: hoy la única forma de agendar es editar la base de datos a mano. Esta spec convierte la aplicación en algo que sostiene la operación diaria de una consulta, no solo su lectura.

También cierra dos promesas abiertas. La SPEC 01 modeló `AppointmentStatus` con seis valores y ninguna pantalla escribe ese campo, así que una cita `UNCONFIRMED` lo es para siempre. Y la SPEC 02 dejó la pestaña `Citas` del expediente con un `EmptyState` y una nota que dice «lo rellena la SPEC 03».

Por último, define lo que hasta ahora era decorativo: `Appointment.travelMin` existe desde la SPEC 01 y solo se usa para pintar «18 min». Aquí pasa a reservar hueco real en la agenda, que es lo que distingue una visita a domicilio de una cita en consulta.

## Scope

**In:**

- Ruta `/app/calendario` con tres vistas conmutables — `Día`, `Semana` y `Mes` — controladas por los parámetros de URL `?vista=` y `?fecha=`, de modo que cualquier estado del calendario sea enlazable.
- Vista `Día`: tira de los seis días de la semana con contador por día y lista cronológica de citas, fiel a `assets/celular_calendario.png`.
- Vista `Semana`: rejilla de seis columnas (`LUN`–`SÁB`) por franjas horarias, fiel a `assets/tablet_calendario_semana.png`, con el pie de contadores y la leyenda de tipos.
- Vista `Mes`: rejilla del mes en curso donde cada celda lista sus citas como chips (`10:00 Lucía F.`) y colapsa el exceso en `+N más`.
- Navegación entre periodos con `‹` / `›` y botón `Hoy`, coherente con la vista activa.
- Modelo nuevo `CalendarBlock`: bloqueos de agenda sin paciente (cierre de caja, formación, ausencias).
- Constantes de horario laboral en `src/lib/schedule.ts` y cálculo de **huecos libres** derivado de ellas.
- Alta de cita en `/app/calendario/nueva` y edición en `/app/calendario/[id]/editar`, con Server Actions y validación en servidor.
- Validación de solapes que **bloquea el guardado**, contando el tiempo de viaje de las visitas a domicilio como tiempo ocupado antes y después de la cita.
- Cambio de estado de una cita (`Confirmada`, `Terminada`, `Cancelada`, `No asistió`) desde el calendario y desde la agenda del día.
- Borrado definitivo de una cita, con confirmación previa.
- Reprogramación arrastrando la cita en las vistas `Semana` y `Día`, con ratón y con gesto táctil, con ajuste a franjas de 30 minutos.
- Gestión de la visita a domicilio: campos `location`, `address` y `travelMin` en el formulario, y cálculo de la hora de salida (`Salir a las 17:12`).
- Pestaña `Citas` del expediente (`/app/pacientes/[id]/citas`): próximas y pasadas, más el botón `Agendar` que abre el formulario con el paciente ya seleccionado.
- Cambios en `/app/agenda`: acciones de estado en cada cita del día, filas de `hueco libre` intercaladas y el panel `Visita a domicilio` alimentado por la cita `HOME` real del día.
- Ampliación de `prisma/seed.ts`: la semana completa del mockup (17–22 de agosto de 2026), citas en las semanas contigua anterior y posterior para que la vista `Mes` tenga contenido, y el bloqueo `Cierre de caja` del viernes.

**Out of scope (para specs futuras):**

- Recordatorios y avisos al paciente, incluida la generación automática de alertas por cita sin confirmar — SPEC 05.
- Portal del paciente y confirmación de cita por parte del paciente — SPEC 05.
- Mapa real con cálculo automático del tiempo de viaje: el recuadro de ruta sigue siendo un marcador de posición y `travelMin` lo teclea el terapeuta.
- Edición del horario laboral desde una pantalla de ajustes: vive en una constante de código.
- Citas recurrentes o series.
- Lista de espera y reasignación automática de huecos.
- Sincronización con Google Calendar, iCal o cualquier calendario externo.
- Vista de agenda de varios terapeutas a la vez.
- Historial de cambios de una cita (quién la movió y cuándo).

## Modelo de datos

Esta spec añade **una tabla** y no modifica ninguna existente. Se respeta la regla de la SPEC 01: las specs 02–05 pueden añadir, nunca renombrar ni eliminar.

```prisma
model CalendarBlock {
  id          String    @id @default(cuid())
  therapistId String
  therapist   Therapist @relation(fields: [therapistId], references: [id])
  startsAt    DateTime
  durationMin Int
  label       String
}
```

`Therapist` gana la relación inversa `calendarBlocks CalendarBlock[]`.

El horario laboral no se persiste; vive en `src/lib/schedule.ts`:

```ts
export const WORKING_HOURS = { startHour: 8, endHour: 19 };
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // lunes a sábado
export const SLOT_MIN = 30;        // granularidad de la rejilla y del arrastre
export const MIN_FREE_SLOT_MIN = 45; // un hueco menor que esto no se anuncia
```

Convenciones:

- **Intervalo ocupado de una cita.** Para `location = CLINIC` es `[startsAt, startsAt + durationMin)`. Para `location = HOME` es `[startsAt − travelMin, startsAt + durationMin + travelMin)`. Ese intervalo es el que usan tanto la detección de solapes como el cálculo de huecos.
- Las citas con `status` `CANCELLED` o `NO_SHOW` **no ocupan** intervalo: su hueco vuelve a estar libre y no bloquean un alta nueva.
- Un `CalendarBlock` ocupa `[startsAt, startsAt + durationMin)` y nunca tiene paciente.
- Un **hueco libre** es un tramo contiguo dentro de `WORKING_HOURS`, en un día de `WORKING_DAYS`, no cubierto por ningún intervalo ocupado, de duración mayor o igual a `MIN_FREE_SLOT_MIN`.
- La URL es la fuente de verdad de la vista: `?vista=dia|semana|mes` y `?fecha=YYYY-MM-DD` interpretada en `America/Managua`. Sin parámetros, `vista=semana` y `fecha` = hoy en Managua.
- La semana empieza en **lunes** y se muestran seis días (`LUN`–`SÁB`); el domingo no es día laboral y no se pinta.
- Toda query de citas y bloqueos filtra por `therapistId`, igual que en las specs 01 y 02. Abrir la edición de una cita de otro terapeuta devuelve 404.
- Todo el formateo y toda la aritmética de fechas pasa por `src/lib/datetime.ts`. Los helpers nuevos que esta spec necesita (`startOfWeekManagua`, `addDaysManagua`, `startOfMonthManagua`, `formatMonthYearManagua`, `weekNumberManagua`) se añaden ahí, no en los componentes.

## Plan de implementación

1. Añadir el modelo `CalendarBlock` y la relación inversa en `Therapist` a `prisma/schema.prisma`. Correr `npx prisma migrate dev --name calendar-blocks`.
2. Ampliar `src/lib/datetime.ts` con los helpers de navegación de periodo: `startOfWeekManagua`, `addDaysManagua`, `startOfMonthManagua`, `formatMonthYearManagua`, `weekNumberManagua`. Verificación: llamarlos desde `/design` y comprobar que la semana del 19 de agosto de 2026 empieza el lunes 17.
3. Crear `src/lib/schedule.ts` con las constantes de horario, `occupiedInterval(appointment)`, `overlaps(a, b)` y `findFreeSlots(dayStart, appointments, blocks)`.
4. Crear `src/lib/appointments.ts` con `listAppointmentsInRange(therapistId, from, to)`, `listBlocksInRange(therapistId, from, to)`, `getAppointmentById(therapistId, id)` y `listPatientAppointments(therapistId, patientId)`, todas filtrando por terapeuta.
5. Ampliar `prisma/seed.ts` con la semana del mockup (17–22 de agosto de 2026) para los siete pacientes, repartida en las franjas que muestra `assets/tablet_calendario_semana.png`.
6. Ampliar `prisma/seed.ts` con citas en la semana anterior y la posterior, y con el `CalendarBlock` `Cierre de caja` del viernes 21 a las 17:00, para que las vistas `Mes` y `Semana` tengan contenido real.
7. Construir el armazón de `/app/calendario`: lectura de `?vista=` y `?fecha=`, barra superior con eyebrow del periodo, conmutador de vistas, `‹` / `›`, `Hoy` y el botón `Agendar`.
8. Construir la vista `Semana` en `src/components/calendario/WeekGrid.tsx`: rejilla de seis columnas por franjas, chips de cita con hora, nombre y distintivo de domicilio, bloqueos, huecos libres, leyenda y contadores del pie.
9. Construir la vista `Día` en `src/components/calendario/DayView.tsx`: tira de días con contador y lista cronológica con las filas de hueco libre intercaladas.
10. Construir la vista `Mes` en `src/components/calendario/MonthGrid.tsx`: rejilla del mes, chips por celda, `+N más` al desbordar y clic en el día que navega a `?vista=dia`.
11. Crear `src/app/app/calendario/actions.ts` con `createAppointment`, `updateAppointment`, `deleteAppointment` y `setAppointmentStatus`, todas validando propiedad por `therapistId` y solapes mediante `src/lib/schedule.ts`.
12. Construir el formulario compartido `src/components/calendario/AppointmentForm.tsx` y las rutas `/app/calendario/nueva` (que acepta `?fecha=`, `?hora=` y `?paciente=` para prerrellenarse) y `/app/calendario/[id]/editar`, con el error de solape mostrado en línea.
13. Añadir el menú de acciones de la cita (`Confirmar`, `Terminada`, `No asistió`, `Cancelar`, `Editar`, `Eliminar`) en el calendario, con confirmación previa al borrado.
14. Añadir la reprogramación por arrastre en `WeekGrid` y `DayView`: eventos de puntero unificados para ratón y gesto táctil, `touch-action: none` en el chip arrastrable, ajuste a `SLOT_MIN` y llamada a `updateAppointment` al soltar.
15. Rellenar la pestaña `Citas` del expediente en `src/app/app/pacientes/[id]/citas/page.tsx`: `PRÓXIMAS` y `PASADAS` con estado, y botón `Agendar` que abre el formulario con `?paciente=`.
16. Actualizar `/app/agenda`: acciones de estado en cada cita del día, filas de `hueco libre` intercaladas y el panel `Visita a domicilio` alimentado por la cita `HOME` real del día con su hora de salida.

## Acceptance criteria

- [ ] `npm run typecheck` y `npm run lint` terminan sin errores.
- [ ] `npx prisma migrate reset` recrea la base y siembra sin fallar, incluidos los `CalendarBlock`.
- [ ] `/app/calendario` sin parámetros abre la vista `Semana` en la semana que contiene el día de hoy en Managua.
- [ ] Pulsar `Día`, `Semana` y `Mes` cambia la vista y deja el valor reflejado en `?vista=` de la URL.
- [ ] Copiar la URL `/app/calendario?vista=semana&fecha=2026-08-17` y abrirla en otra pestaña muestra exactamente la misma semana.
- [ ] En la vista `Semana` del 17 al 22 de agosto de 2026 cada cita sembrada aparece en su columna de día y su franja horaria correctas.
- [ ] El bloqueo `Cierre de caja` aparece el viernes 21 a las 17:00 y no se cuenta como hueco libre.
- [ ] El contador del pie de la vista `Semana` coincide con el número de citas pintadas en la rejilla.
- [ ] En la vista `Mes` una celda con más citas de las que caben muestra `+N más`, y pulsar el número del día navega a `?vista=dia` de ese día.
- [ ] `‹` y `›` retroceden y avanzan un día, una semana o un mes según la vista activa, y `Hoy` vuelve al día actual.
- [ ] El botón `Agendar` abre `/app/calendario/nueva` con la fecha del periodo visible ya rellenada.
- [ ] Guardar una cita nueva la hace aparecer en el calendario sin recargar a mano.
- [ ] Intentar guardar una cita de 10:00 a 10:45 del lunes 17, cuando Lucía Ferrer ya tiene esa franja, muestra un error en línea y **no** crea la cita.
- [ ] Con la visita a domicilio de Carmen Ruiz el lunes a las 17:30 con `travelMin = 18`, intentar agendar una cita en consulta a las 18:00 se rechaza por solape.
- [ ] Cancelar esa visita a domicilio y volver a intentar la cita de las 18:00 la deja guardar.
- [ ] Cambiar el estado de una cita a `Terminada` actualiza su píldora en el calendario y en `/app/agenda`.
- [ ] Eliminar una cita pide confirmación y, al aceptar, desaparece del calendario y de la pestaña `Citas` del paciente.
- [ ] Arrastrar con el ratón una cita en la vista `Semana` de las 10:00 a las 11:30 la guarda en la hora nueva y la conserva tras recargar.
- [ ] Arrastrar esa misma cita con el dedo a 390px de ancho en la vista `Día` la reprograma igual, sin que la página haga scroll durante el gesto.
- [ ] Soltar una cita encima de otra ocupada la devuelve a su posición original y muestra el mensaje de solape.
- [ ] La pestaña `Citas` de Lucía Ferrer lista sus citas separadas en `PRÓXIMAS` y `PASADAS`, en orden cronológico.
- [ ] El botón `Agendar` de esa pestaña abre el formulario con Lucía Ferrer ya seleccionada.
- [ ] Abrir `/app/calendario/[id]/editar` con el `id` de una cita de otro terapeuta devuelve 404.
- [ ] `/app/agenda` muestra `13:00 · hueco libre` entre las citas del lunes 17, calculado y no escrito a mano.
- [ ] El panel `Visita a domicilio` de `/app/agenda` muestra a Carmen Ruiz y `Salir a las 17:12`, derivado de `startsAt − travelMin`.
- [ ] A 390px de ancho el calendario se ve sin scroll horizontal en las tres vistas.
- [ ] A 1024px de ancho la vista `Semana` reproduce la rejilla de `assets/tablet_calendario_semana.png`.
- [ ] Con la variable de entorno `TZ` del servidor puesta en un valor distinto de `America/Managua`, la cita de las 10:00 sigue apareciendo a las 10:00 y en el lunes.

## Decisiones

- **Sí:** las tres vistas con citas dibujadas, incluida `Mes`. Se consideró dejar `Mes` como rejilla de contadores para no inventar diseño donde no hay mockup; se descarta porque un mes sin nombres obliga a entrar en cada día para saber qué hay. El `+N más` resuelve el desbordamiento sin romper el layout.
- **Sí:** la URL como fuente de verdad de la vista y el periodo (`?vista=`, `?fecha=`). Permite enlazar una semana concreta, funciona con el botón atrás del navegador y evita estado de cliente que se pierde al recargar.
- **Sí:** horario laboral en una constante de `src/lib/schedule.ts`. Hay un solo terapeuta en el MVP y una tabla `WorkingHours` arrastraría una pantalla de ajustes que ninguna spec contempla. Es el mismo criterio con el que se fijaron `es-NI` y `America/Managua`.
- **No:** modelo `WorkingHours` en base de datos. Se reconsidera si llega el multi-terapeuta o una consulta con horarios distintos por día.
- **Sí:** `CalendarBlock` como tabla nueva para lo que no es una cita de paciente. Se consideró reutilizar `Appointment` con `patientId` opcional; se descarta porque volvería nullable una relación que las specs 01 y 02 asumen obligatoria y obligaría a comprobar `null` en todas las queries ya escritas.
- **Sí:** el tiempo de viaje reserva hueco antes y después de una visita a domicilio. Sin eso `travelMin` es un adorno y el sistema deja agendar una cita en consulta mientras el terapeuta va conduciendo.
- **Sí:** bloquear el guardado ante un solape, en vez de avisar y permitir. Un terapeuta no puede estar en dos sitios a la vez; permitir el dato obliga a limpiarlo a mano después.
- **Sí:** las citas `CANCELLED` y `NO_SHOW` liberan su hueco. Es el comportamiento que espera quien cancela para meter a otro paciente.
- **Sí:** rutas propias para el formulario (`/nueva`, `/[id]/editar`), igual que el formulario de paciente de la SPEC 02. Un patrón repetido vale más que un panel deslizante nuevo, y la ruta admite parámetros de prerrelleno (`?fecha=`, `?hora=`, `?paciente=`).
- **Sí:** reprogramar arrastrando también con gesto táctil, no solo con ratón. Es la pieza más cara de la spec y se asume a conciencia: el terapeuta usa el móvil en consulta, y un arrastre que solo funciona en escritorio deja la función inservible donde más se usa. Se mitiga con eventos de puntero unificados y `touch-action: none` en el chip.
- **Sí:** el arrastre reutiliza `updateAppointment`, la misma Server Action del formulario. Una sola validación de solapes para las dos vías de reprogramación.
- **No:** arrastrar en la vista `Mes`. Una celda de mes no tiene resolución horaria; mover ahí una cita significaría cambiarle el día conservando la hora, que es ambiguo. Desde `Mes` se reprograma por formulario.
- **Sí:** borrado definitivo de citas, además de cancelarlas. A diferencia del expediente clínico, una cita creada por error no tiene valor histórico. Cancelar sigue siendo lo recomendado y conserva el registro.
- **Sí:** rellenar la pestaña `Citas` del expediente en esta spec. Es el compromiso explícito que dejó anotado la SPEC 02.
- **Sí:** `/app/agenda` gana acciones de estado, huecos libres y el panel de domicilio conectado. La agenda del día es la pantalla donde el terapeuta está durante la jornada; obligarle a ir al calendario para marcar una cita como terminada rompe el flujo.
- **No:** mapa real con cálculo automático del tiempo de viaje. Exige clave de API, facturación y geocodificación de direcciones. Se mantiene el recuadro punteado que ya existe en `AgendaSidePanel` y el terapeuta teclea los minutos, en la misma línea que dejar Twilio como mock.
- **No:** citas recurrentes, lista de espera y sincronización con calendarios externos. Cada una tiene su propio modelo de datos y su propia spec si llegan a hacer falta.
- **No:** tests automatizados. Se mantiene la decisión de las specs 01 y 02; la verificación es manual contra los criterios de aceptación.

## Risks

| Riesgo | Mitigación |
|---|---|
| El arrastre táctil pelea con el scroll de la página y el calendario se vuelve inusable en móvil | `touch-action: none` solo en el chip arrastrable, no en el contenedor, y el arrastre solo se activa tras mantener pulsado; la rejilla sigue haciendo scroll normalmente. |
| La aritmética de semanas y meses se desplaza por la zona horaria del servidor | Todos los helpers de periodo viven en `src/lib/datetime.ts` sobre `managuaDateTimeToUtc`, y hay un criterio de aceptación que verifica el comportamiento con `TZ` alterada. |
| El intervalo con tiempo de viaje bloquea huecos que el terapeuta considera utilizables | El bloqueo solo aplica a citas con `location = HOME` y `travelMin` no nulo; dejar `travelMin` vacío devuelve el comportamiento simple. |
| Dos pestañas abiertas reprograman la misma cita y la última gana en silencio | La validación de solapes corre en la Server Action contra el estado actual de la base, así que la segunda escritura se rechaza si el hueco dejó de estar libre. |
| La vista `Mes` con muchas citas por celda desborda en móvil | Las celdas colapsan en `+N más` a partir del número que cabe, y el número del día navega a la vista `Día`. |
| El cálculo de huecos recorre todas las citas del periodo en cada carga | Con un terapeuta y decenas de citas por mes el coste es irrelevante. Si crece, se acota la consulta al rango visible, que ya es lo que hace `listAppointmentsInRange`. |
| La rejilla de `Semana` no cabe en 390px y aparece scroll horizontal | En móvil la vista por defecto es `Día`; `Semana` en móvil se degrada a columnas apiladas por día. Hay un criterio de aceptación explícito. |

## Lo que **no** entra en esta spec

- Recordatorios, avisos y generación automática de alertas (SPEC 05).
- Portal del paciente y confirmación de cita por el propio paciente (SPEC 05).
- Mapa real y cálculo automático del tiempo de viaje.
- Configuración del horario laboral desde una pantalla de ajustes.
- Citas recurrentes, lista de espera y sincronización con calendarios externos.
- Agenda de varios terapeutas y historial de cambios de una cita.

Cada uno de estos, cuando le toque, se define en su propia spec.
