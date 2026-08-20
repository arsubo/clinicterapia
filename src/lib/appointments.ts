import { prisma } from "@/lib/prisma";

const PATIENT_SELECT = { id: true, fullName: true, homeAddress: true } as const;

export function listAppointmentsInRange(therapistId: string, from: Date, to: Date) {
  return prisma.appointment.findMany({
    where: { therapistId, startsAt: { gte: from, lt: to } },
    include: { patient: { select: PATIENT_SELECT } },
    orderBy: { startsAt: "asc" },
  });
}

export function listBlocksInRange(therapistId: string, from: Date, to: Date) {
  return prisma.calendarBlock.findMany({
    where: { therapistId, startsAt: { gte: from, lt: to } },
    orderBy: { startsAt: "asc" },
  });
}

export function getAppointmentById(therapistId: string, id: string) {
  return prisma.appointment.findFirst({
    where: { id, therapistId },
    include: { patient: { select: PATIENT_SELECT } },
  });
}

export function listPatientAppointments(therapistId: string, patientId: string) {
  return prisma.appointment.findMany({
    where: { therapistId, patientId },
    orderBy: { startsAt: "asc" },
  });
}
