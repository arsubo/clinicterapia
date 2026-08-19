"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { managuaDateTimeToUtc } from "@/lib/datetime";
import type { PatientStatus } from "@prisma/client";

export type PatientFormState = {
  errors: Partial<Record<"fullName" | "recordNo" | "age" | "plannedSessions" | "startedAt", string>>;
  values: Record<string, string>;
};

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const text = value?.toString().trim();
  return text ? text : undefined;
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null | typeof INVALID {
  const text = value?.toString().trim();
  if (!text) return null;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 0) return INVALID;
  return parsed;
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null | typeof INVALID {
  const text = value?.toString().trim();
  if (!text) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return INVALID;
  const [, year, month, day] = match;
  return managuaDateTimeToUtc(Number(year), Number(month), Number(day), 0, 0);
}

const INVALID = Symbol("invalid");

export async function savePatientAction(
  _prevState: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) redirect("/acceso");

  const values = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, value.toString()]),
  );

  const id = optionalString(formData.get("id"));
  const fullName = optionalString(formData.get("fullName"));
  const recordNo = optionalString(formData.get("recordNo"));
  const age = parseOptionalInt(formData.get("age"));
  const plannedSessions = parseOptionalInt(formData.get("plannedSessions"));
  const startedAt = parseOptionalDate(formData.get("startedAt"));

  const errors: PatientFormState["errors"] = {};
  if (!fullName) errors.fullName = "El nombre es obligatorio.";
  if (!recordNo) errors.recordNo = "El número de expediente es obligatorio.";
  if (age === INVALID) errors.age = "Introduce una edad válida.";
  if (plannedSessions === INVALID) errors.plannedSessions = "Introduce un número de sesiones válido.";
  if (startedAt === INVALID) errors.startedAt = "Introduce una fecha válida.";

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const status = formData.get("status")?.toString() as PatientStatus;

  const data = {
    fullName: fullName!,
    recordNo: recordNo!,
    age: age === INVALID ? null : age,
    homeAddress: optionalString(formData.get("homeAddress")) ?? null,
    status: status === "DISCHARGED" ? ("DISCHARGED" as const) : ("ACTIVE" as const),
    diagnosis: optionalString(formData.get("diagnosis")) ?? null,
    phone: optionalString(formData.get("phone")) ?? null,
    contactEmail: optionalString(formData.get("contactEmail")) ?? null,
    plannedSessions: plannedSessions === INVALID ? null : plannedSessions,
    notes: optionalString(formData.get("notes")) ?? null,
    startedAt: startedAt === INVALID ? null : startedAt,
  };

  if (id) {
    const existing = await prisma.patient.findFirst({
      where: { id, therapistId: therapist.id },
      select: { id: true },
    });
    if (!existing) notFound();

    await prisma.patient.update({ where: { id }, data });
    redirect(`/app/pacientes/${id}`);
  }

  await prisma.patient.create({
    data: { ...data, therapistId: therapist.id },
  });

  redirect("/app/pacientes");
}

export type SessionFormState = {
  errors: Partial<Record<"occurredAt" | "sequenceNo" | "painScore" | "rotationDeg", string>>;
  values: Record<string, string>;
  success: boolean;
};

function parseRequiredDate(value: FormDataEntryValue | null): Date | typeof INVALID {
  const parsed = parseOptionalDate(value);
  if (parsed === null) return INVALID;
  return parsed;
}

function parsePainScore(value: FormDataEntryValue | null): number | typeof INVALID {
  const text = value?.toString().trim();
  if (!text) return INVALID;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10) return INVALID;
  return parsed;
}

function parsePositiveInt(value: FormDataEntryValue | null): number | typeof INVALID {
  const text = value?.toString().trim();
  if (!text) return INVALID;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 1) return INVALID;
  return parsed;
}

export async function createSessionAction(
  _prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) redirect("/acceso");

  const patientId = formData.get("patientId")?.toString();
  if (!patientId) notFound();

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, therapistId: therapist.id },
    select: { id: true, plannedSessions: true },
  });
  if (!patient) notFound();

  const values = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, value.toString()]),
  );

  const occurredAt = parseRequiredDate(formData.get("occurredAt"));
  const sequenceNo = parsePositiveInt(formData.get("sequenceNo"));
  const painScore = parsePainScore(formData.get("painScore"));
  const rotationDeg = parseOptionalInt(formData.get("rotationDeg"));

  const errors: SessionFormState["errors"] = {};
  if (occurredAt === INVALID) errors.occurredAt = "Introduce una fecha válida.";
  if (sequenceNo === INVALID) errors.sequenceNo = "Introduce un número de sesión válido.";
  if (painScore === INVALID) errors.painScore = "Introduce un valor de dolor entre 0 y 10.";
  if (rotationDeg === INVALID) errors.rotationDeg = "Introduce un valor de rotación válido.";

  if (Object.keys(errors).length > 0) {
    return { errors, values, success: false };
  }

  await prisma.session.create({
    data: {
      patientId: patient.id,
      occurredAt: occurredAt as Date,
      sequenceNo: sequenceNo as number,
      totalPlanned: patient.plannedSessions ?? (sequenceNo as number),
      painScore: painScore as number,
      rotationDeg: rotationDeg === null ? null : (rotationDeg as number),
      note: optionalString(formData.get("note")) ?? null,
    },
  });

  revalidatePath(`/app/pacientes/${patient.id}`);
  revalidatePath(`/app/pacientes/${patient.id}/sesiones`);

  return { errors: {}, values: {}, success: true };
}

export type SessionNoteFormState = {
  error?: string;
  success: boolean;
};

export async function updateSessionNoteAction(
  _prevState: SessionNoteFormState,
  formData: FormData,
): Promise<SessionNoteFormState> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) redirect("/acceso");

  const sessionId = formData.get("sessionId")?.toString();
  if (!sessionId) notFound();

  const existing = await prisma.session.findFirst({
    where: { id: sessionId, patient: { therapistId: therapist.id } },
    select: { id: true, patientId: true },
  });
  if (!existing) notFound();

  await prisma.session.update({
    where: { id: sessionId },
    data: { note: optionalString(formData.get("note")) ?? null },
  });

  revalidatePath(`/app/pacientes/${existing.patientId}`);
  revalidatePath(`/app/pacientes/${existing.patientId}/sesiones`);

  return { success: true };
}
