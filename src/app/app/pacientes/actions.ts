"use server";

import { notFound, redirect } from "next/navigation";
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
