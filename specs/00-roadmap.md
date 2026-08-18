# Roadmap de specs — ClinicTerapia

> Índice de las specs planeadas para el MVP de ClinicTerapia by César Fonseca. Cada una se escribe con `/spec` cuando le toca su turno; este documento solo fija el orden y las dependencias.

| # | Spec | Objetivo en una frase | Depende de |
|---|------|------------------------|------------|
| 01 | Fundación, design system y acceso | Levantar el proyecto Next.js con su design system, esquema de datos completo, login por email/password y la Agenda del día funcional. | — |
| 02 | Pacientes y expediente clínico | Listado de pacientes y ficha de expediente con resumen, historial de sesiones y datos clínicos. | 01 |
| 03 | Agenda, calendario y citas a domicilio | Calendario en vista día/semana/mes, alta y edición de citas, y gestión de visitas a domicilio con ruta y tiempo de viaje. | 01, 02 |
| 04 | Diagrama de síntomas y rutinas en casa | Mapa corporal interactivo para registrar dolor por zona/sesión y gestión de rutinas de ejercicios con adherencia. | 02 |
| 05 | Alertas, recordatorios mock y portal del paciente | Bandeja de alertas accionables, recordatorios simulados (sin envío real) y el portal donde el paciente ve su rutina y registra dolor. | 03, 04 |

## Notas

- Twilio queda fuera de todo el MVP: los recordatorios y avisos se modelan y se muestran en la interfaz, pero no se envían por ningún canal real (decisión tomada en la SPEC 01).
- El esquema de datos completo se define de una vez en la SPEC 01 para que las specs 02–05 solo lo consuman y lo extiendan, sin migraciones acopladas entre ellas.
- Localización fija: `es-NI`, zona horaria `America/Managua`.
