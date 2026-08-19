"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AppointmentLocation, AppointmentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { managuaDateParts, managuaDateTimeToUtc } from "@/lib/datetime";
import { blockInterval, occupiedInterval, overlaps } from "@/lib/schedule";
import { listAppointmentsInRange, listBlocksInRange } from "@/lib/appointments";

export type AppointmentFormState = {
  errors: Partial<
    Record<"patientId" | "fecha" | "hora" | "durationMin" | "location" | "travelMin" | "reasonLabel" | "overlap", string>
  >;
  values: Record<string, string>;
};

type AppointmentData = {
  patientId: string;
  startsAt: Date;
  durationMin: number;
  location: AppointmentLocation;
  address: string | null;
  travelMin: number | null;
  reasonLabel: string;
};

function toFecha(parts: { year: number; month: number; day: number }): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

async function requireTherapist() {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) redirect("/acceso");

  return therapist;
}

async function parseAppointmentForm(
  formData: FormData,
  therapistId: string,
): Promise<{ data: AppointmentData } | { errors: AppointmentFormState["errors"] }> {
  const errors: AppointmentFormState["errors"] = {};

  const patientId = formData.get("patientId")?.toString().trim();
  const fecha = formData.get("fecha")?.toString().trim();
  const hora = formData.get("hora")?.toString().trim();
  const durationText = formData.get("durationMin")?.toString().trim();
  const location = formData.get("location")?.toString().trim();
  const address = formData.get("address")?.toString().trim();
  const travelText = formData.get("travelMin")?.toString().trim();
  const reasonLabel = formData.get("reasonLabel")?.toString().trim();

  let patient: { id: string } | null = null;
  if (!patientId) {
    errors.patientId = "Selecciona un paciente.";
  } else {
    patient = await prisma.patient.findFirst({ where: { id: patientId, therapistId }, select: { id: true } });
    if (!patient) errors.patientId = "Paciente no válido.";
  }

  const fechaMatch = fecha ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha) : null;
  if (!fechaMatch) errors.fecha = "Introduce una fecha válida.";

  const horaMatch = hora ? /^(\d{2}):(\d{2})$/.exec(hora) : null;
  if (!horaMatch) errors.hora = "Introduce una hora válida.";

  const durationMin = durationText ? Number(durationText) : 45;
  if (!Number.isInteger(durationMin) || durationMin <= 0) errors.durationMin = "Duración no válida.";

  const resolvedLocation: AppointmentLocation = location === "HOME" ? "HOME" : "CLINIC";

  let travelMin: number | null = null;
  if (travelText) {
    const parsedTravel = Number(travelText);
    if (!Number.isInteger(parsedTravel) || parsedTravel < 0) {
      errors.travelMin = "Minutos de viaje no válidos.";
    } else {
      travelMin = parsedTravel;
    }
  }

  if (!reasonLabel) errors.reasonLabel = "Describe el motivo de la cita.";

  if (Object.keys(errors).length > 0) return { errors };

  const [, year, month, day] = fechaMatch!;
  const [, hour, minute] = horaMatch!;
  const startsAt = managuaDateTimeToUtc(Number(year), Number(month), Number(day), Number(hour), Number(minute));

  return {
    data: {
      patientId: patient!.id,
      startsAt,
      durationMin,
      location: resolvedLocation,
      address: address || null,
      travelMin: resolvedLocation === "HOME" ? travelMin : null,
      reasonLabel: reasonLabel!,
    },
  };
}

async function hasOverlap(
  therapistId: string,
  candidate: Pick<AppointmentData, "startsAt" | "durationMin" | "location" | "travelMin">,
  excludeAppointmentId?: string,
): Promise<boolean> {
  const candidateInterval = occupiedInterval({ ...candidate, status: "SCHEDULED" });
  if (!candidateInterval) return false;

  const { year, month, day } = managuaDateParts(candidate.startsAt);
  const dayStart = managuaDateTimeToUtc(year, month, day, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [dayAppointments, dayBlocks] = await Promise.all([
    listAppointmentsInRange(therapistId, dayStart, dayEnd),
    listBlocksInRange(therapistId, dayStart, dayEnd),
  ]);

  for (const appt of dayAppointments) {
    if (appt.id === excludeAppointmentId) continue;
    const interval = occupiedInterval(appt);
    if (interval && overlaps(candidateInterval, interval)) return true;
  }

  for (const block of dayBlocks) {
    if (overlaps(candidateInterval, blockInterval(block))) return true;
  }

  return false;
}

function revalidateCalendarViews(patientId: string) {
  revalidatePath("/app/calendario");
  revalidatePath("/app/agenda");
  revalidatePath(`/app/pacientes/${patientId}/citas`);
}

export async function createAppointment(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const therapist = await requireTherapist();
  const values = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, value.toString()]));

  const parsed = await parseAppointmentForm(formData, therapist.id);
  if ("errors" in parsed) return { errors: parsed.errors, values };

  if (await hasOverlap(therapist.id, parsed.data)) {
    return { errors: { overlap: "Esta franja se solapa con otra cita o bloqueo existente." }, values };
  }

  await prisma.appointment.create({ data: { ...parsed.data, therapistId: therapist.id } });

  revalidateCalendarViews(parsed.data.patientId);
  redirect(`/app/calendario?vista=dia&fecha=${toFecha(managuaDateParts(parsed.data.startsAt))}`);
}

export async function updateAppointment(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const therapist = await requireTherapist();
  const values = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, value.toString()]));

  const id = formData.get("id")?.toString();
  if (!id) notFound();

  const existing = await prisma.appointment.findFirst({
    where: { id, therapistId: therapist.id },
    select: { id: true },
  });
  if (!existing) notFound();

  const parsed = await parseAppointmentForm(formData, therapist.id);
  if ("errors" in parsed) return { errors: parsed.errors, values };

  if (await hasOverlap(therapist.id, parsed.data, id)) {
    return { errors: { overlap: "Esta franja se solapa con otra cita o bloqueo existente." }, values };
  }

  await prisma.appointment.update({ where: { id }, data: parsed.data });

  revalidateCalendarViews(parsed.data.patientId);
  redirect(`/app/calendario?vista=dia&fecha=${toFecha(managuaDateParts(parsed.data.startsAt))}`);
}

export async function deleteAppointment(id: string): Promise<void> {
  const therapist = await requireTherapist();

  const existing = await prisma.appointment.findFirst({
    where: { id, therapistId: therapist.id },
    select: { id: true, patientId: true },
  });
  if (!existing) notFound();

  await prisma.appointment.delete({ where: { id } });

  revalidateCalendarViews(existing.patientId);
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const therapist = await requireTherapist();

  const existing = await prisma.appointment.findFirst({
    where: { id, therapistId: therapist.id },
    select: { id: true, patientId: true },
  });
  if (!existing) notFound();

  await prisma.appointment.update({ where: { id }, data: { status } });

  revalidateCalendarViews(existing.patientId);
}
