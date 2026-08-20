import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const appt = await prisma.appointment.findFirst({
    where: { reasonLabel: { contains: "Domicilio · C/ Salitre 14" }, startsAt: { gte: new Date("2026-08-17T00:00:00Z"), lt: new Date("2026-08-18T00:00:00Z") } },
  });
  console.log(appt);
}
main().finally(() => prisma.$disconnect());
