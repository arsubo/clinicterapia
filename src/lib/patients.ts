import { prisma } from "@/lib/prisma";

export type PatientFilter = "activos" | "domicilio" | "alta";

export function listPatients(
  therapistId: string,
  options: { query?: string; filter?: PatientFilter } = {},
) {
  const { query, filter } = options;
  const trimmedQuery = query?.trim();

  return prisma.patient.findMany({
    where: {
      therapistId,
      ...(filter === "alta" ? { status: "DISCHARGED" as const } : {}),
      ...(filter === "activos" ? { status: "ACTIVE" as const } : {}),
      ...(filter === "domicilio" ? { appointments: { some: { location: "HOME" as const } } } : {}),
      ...(trimmedQuery
        ? {
            OR: [
              { fullName: { contains: trimmedQuery, mode: "insensitive" as const } },
              { recordNo: { contains: trimmedQuery, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      appointments: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 1,
      },
      sessions: {
        orderBy: { occurredAt: "desc" },
        take: 2,
      },
      alerts: {
        where: { resolvedAt: null },
        select: { id: true, type: true },
      },
    },
    orderBy: { fullName: "asc" },
  });
}

export function getPatientById(therapistId: string, id: string) {
  return prisma.patient.findFirst({
    where: { id, therapistId },
    include: {
      sessions: { orderBy: { occurredAt: "asc" } },
      routines: { include: { items: true, logs: true } },
      alerts: { where: { resolvedAt: null }, orderBy: { createdAt: "asc" } },
      appointments: { orderBy: { startsAt: "asc" } },
    },
  });
}
