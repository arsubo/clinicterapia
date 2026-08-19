import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { managuaDateTimeToUtc, todayInManagua } from "../src/lib/datetime";

const prisma = new PrismaClient();

const THERAPIST_PASSWORD = "clinicterapia123";
const PATIENT_PASSWORD = "paciente123";

async function resetData() {
  await prisma.symptomMark.deleteMany();
  await prisma.routineLog.deleteMany();
  await prisma.routineItem.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.painLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.session.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetData();

  const { year, month, day } = todayInManagua();
  const at = (hour: number, minute: number) =>
    managuaDateTimeToUtc(year, month, day, hour, minute);

  const therapistPasswordHash = await bcrypt.hash(THERAPIST_PASSWORD, 10);
  const patientPasswordHash = await bcrypt.hash(PATIENT_PASSWORD, 10);

  const therapistUser = await prisma.user.create({
    data: {
      email: "cesar@pauta.clinic",
      passwordHash: therapistPasswordHash,
      role: "THERAPIST",
    },
  });

  const therapist = await prisma.therapist.create({
    data: {
      userId: therapistUser.id,
      fullName: "César Fonseca",
      licenseNo: "FT-00231",
    },
  });

  const daysAgo = (n: number) => new Date(at(9, 0).getTime() - n * 24 * 60 * 60 * 1000);

  async function createPatient(input: {
    email: string;
    fullName: string;
    age: number;
    recordNo: string;
    homeAddress?: string;
    status?: "ACTIVE" | "DISCHARGED";
    diagnosis?: string;
    phone?: string;
    contactEmail?: string;
    plannedSessions?: number;
    notes?: string;
    startedAt?: Date;
  }) {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: patientPasswordHash,
        role: "PATIENT",
      },
    });

    return prisma.patient.create({
      data: {
        therapistId: therapist.id,
        userId: user.id,
        fullName: input.fullName,
        age: input.age,
        recordNo: input.recordNo,
        homeAddress: input.homeAddress,
        status: input.status ?? "ACTIVE",
        diagnosis: input.diagnosis,
        phone: input.phone,
        contactEmail: input.contactEmail,
        plannedSessions: input.plannedSessions,
        notes: input.notes,
        startedAt: input.startedAt,
      },
    });
  }

  const andres = await createPatient({
    email: "andres@pauta.clinic",
    fullName: "Andrés Molina",
    age: 47,
    recordNo: "0388",
    diagnosis: "Lumbalgia mecánica",
    phone: "+505 8811 2233",
    contactEmail: "andres.molina@correo.ni",
    plannedSessions: 10,
    notes: "Trabajo de oficina, el dolor irradia a la pierna derecha tras jornadas largas sentado.",
    startedAt: daysAgo(42),
  });

  const marta = await createPatient({
    email: "marta@pauta.clinic",
    fullName: "Marta Sanz",
    age: 52,
    recordNo: "0401",
    status: "DISCHARGED",
    diagnosis: "Hombro congelado",
    phone: "+505 8822 3344",
    contactEmail: "marta.sanz@correo.ni",
    plannedSessions: 12,
    notes: "Alta tras completar el plan de movilidad de hombro.",
    startedAt: daysAgo(90),
  });

  const lucia = await createPatient({
    email: "lucia@pauta.clinic",
    fullName: "Lucía Ferrer",
    age: 34,
    recordNo: "0412",
    diagnosis: "Cervicalgia postural",
    phone: "+505 8833 4455",
    contactEmail: "lucia.ferrer@correo.ni",
    plannedSessions: 8,
    notes: "Trabajo remoto con jornadas largas frente al ordenador.",
    startedAt: daysAgo(21),
  });

  const javier = await createPatient({
    email: "javier@pauta.clinic",
    fullName: "Javier Ortega",
    age: 29,
    recordNo: "0420",
    diagnosis: "Postoperatorio de rodilla (LCA)",
    phone: "+505 8844 5566",
    contactEmail: "javier.ortega@correo.ni",
    plannedSessions: 12,
    notes: "Semana 3 post-cirugía, adherencia baja a la rutina asignada.",
    startedAt: daysAgo(21),
  });

  const nuria = await createPatient({
    email: "nuria@pauta.clinic",
    fullName: "Nuria Beltrán",
    age: 41,
    recordNo: "0433",
    diagnosis: "Fascitis plantar",
    phone: "+505 8855 6677",
    contactEmail: "nuria.beltran@correo.ni",
    plannedSessions: 8,
    notes: "Corredora recreativa, dolor matutino en el talón.",
    startedAt: daysAgo(7),
  });

  const tomas = await createPatient({
    email: "tomas@pauta.clinic",
    fullName: "Tomás Iglesias",
    age: 58,
    recordNo: "0447",
    diagnosis: "Epicondilitis lateral",
    phone: "+505 8866 7788",
    contactEmail: "tomas.iglesias@correo.ni",
    plannedSessions: 6,
    notes: "Alta prevista en las próximas dos semanas.",
    startedAt: daysAgo(60),
  });

  const carmen = await createPatient({
    email: "carmen@pauta.clinic",
    fullName: "Carmen Ruiz",
    age: 65,
    recordNo: "0459",
    homeAddress: "C/ Salitre 14, 2°B",
    diagnosis: "Rehabilitación domiciliaria post-fractura de cadera",
    phone: "+505 8877 8899",
    contactEmail: "carmen.ruiz@correo.ni",
    plannedSessions: 10,
    notes: "Movilidad reducida; requiere atención a domicilio.",
    startedAt: daysAgo(14),
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: andres.id,
      startsAt: at(8, 30),
      status: "DONE",
      reasonLabel: "Lumbalgia · sesión 6 de 10",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: marta.id,
      startsAt: at(9, 15),
      status: "DONE",
      reasonLabel: "Hombro · valoración inicial",
    },
  });

  const luciaAppointment = await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: lucia.id,
      startsAt: at(10, 0),
      status: "CONFIRMED",
      reasonLabel: "Cervicalgia · sesión 4 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: javier.id,
      startsAt: at(11, 0),
      status: "SCHEDULED",
      reasonLabel: "Rodilla · postoperatorio · semana 3",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: nuria.id,
      startsAt: at(12, 0),
      status: "UNCONFIRMED",
      reasonLabel: "Fascitis · sesión 2 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: tomas.id,
      startsAt: at(16, 0),
      status: "CONFIRMED",
      reasonLabel: "Epicondilitis · alta prevista",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: carmen.id,
      startsAt: at(17, 30),
      status: "CONFIRMED",
      location: "HOME",
      address: carmen.homeAddress ?? undefined,
      travelMin: 18,
      reasonLabel: "Domicilio · C/ Salitre 14",
    },
  });

  const luciaSessions = await Promise.all([
    prisma.session.create({
      data: {
        patientId: lucia.id,
        occurredAt: new Date(at(10, 0).getTime() - 21 * 24 * 60 * 60 * 1000),
        sequenceNo: 1,
        totalPlanned: 8,
        painScore: 6,
      },
    }),
    prisma.session.create({
      data: {
        patientId: lucia.id,
        occurredAt: new Date(at(10, 0).getTime() - 14 * 24 * 60 * 60 * 1000),
        sequenceNo: 2,
        totalPlanned: 8,
        painScore: 4,
      },
    }),
    prisma.session.create({
      data: {
        patientId: lucia.id,
        occurredAt: new Date(at(10, 0).getTime() - 7 * 24 * 60 * 60 * 1000),
        sequenceNo: 3,
        totalPlanned: 8,
        painScore: 5,
      },
    }),
    prisma.session.create({
      data: {
        patientId: lucia.id,
        occurredAt: at(10, 0),
        sequenceNo: 4,
        totalPlanned: 8,
        painScore: 7,
        rotationDeg: 55,
        note:
          "Empeora tras el cierre de proyecto. Punto gatillo en trapecio superior derecho; se reduce carga del remo y se añade respiración diafragmática.",
      },
    }),
  ]);

  const luciaTodaySession = luciaSessions[3];

  await prisma.symptomMark.createMany({
    data: [
      {
        patientId: lucia.id,
        sessionId: luciaTodaySession.id,
        view: "FRONT",
        x: 0.53,
        y: 0.16,
        zone: "Cuello",
        intensity: 3,
        painType: "DULL",
      },
      {
        patientId: lucia.id,
        sessionId: luciaTodaySession.id,
        view: "FRONT",
        x: 0.6,
        y: 0.23,
        zone: "Cervical derecha",
        intensity: 7,
        painType: "SHARP",
      },
      {
        patientId: lucia.id,
        sessionId: luciaTodaySession.id,
        view: "FRONT",
        x: 0.63,
        y: 0.27,
        zone: "Trapecio superior derecho",
        intensity: 6,
        painType: "TENSION",
      },
    ],
  });

  await prisma.alert.createMany({
    data: [
      {
        therapistId: therapist.id,
        patientId: nuria.id,
        type: "UNCONFIRMED_APPOINTMENT",
        message:
          "Nuria no ha confirmado la cita de hoy a las 12:00. Dos avisos por WhatsApp sin respuesta, último ayer 19:00.",
      },
      {
        therapistId: therapist.id,
        patientId: javier.id,
        type: "ROUTINE_NO_LOG",
        message:
          "Javier Ortega no registra su rutina. Postoperatorio de rodilla, semana 3 · adherencia 42%.",
      },
      {
        therapistId: therapist.id,
        patientId: lucia.id,
        type: "PAIN_INCREASE",
        message:
          "Lucía Ferrer: el dolor cervical sube de 4 a 7 en dos sesiones. Cervical derecha · registrado en el portal y confirmado en sesión.",
      },
    ],
  });

  const [estiramientoCervical, fortalecimientoCore, movilidadHombro, bandaRodilla] =
    await Promise.all([
      prisma.exercise.create({
        data: { name: "Estiramiento cervical", description: "Flexión lateral sostenida 20s por lado." },
      }),
      prisma.exercise.create({
        data: { name: "Fortalecimiento de core", description: "Plancha frontal con apoyo en antebrazos." },
      }),
      prisma.exercise.create({
        data: { name: "Movilidad de hombro", description: "Circunducción con bastón, 2 series de 10." },
      }),
      prisma.exercise.create({
        data: { name: "Banda elástica de rodilla", description: "Extensión de rodilla con banda, 3 series de 12." },
      }),
    ]);

  const routineLogCounts: Record<string, number> = {
    [andres.id]: 5,
    [marta.id]: 6,
    [lucia.id]: 4,
    [javier.id]: 2,
    [nuria.id]: 5,
    [tomas.id]: 6,
    [carmen.id]: 5,
  };

  for (const patient of [andres, marta, lucia, javier, nuria, tomas, carmen]) {
    const routine = await prisma.routine.create({
      data: {
        patientId: patient.id,
        weekLabel: "Semana del 17 al 23 de agosto",
      },
    });

    const items = await Promise.all([
      prisma.routineItem.create({
        data: {
          routineId: routine.id,
          exerciseId: estiramientoCervical.id,
          prescription: "2 series de 10, 3 veces por semana",
          order: 1,
        },
      }),
      prisma.routineItem.create({
        data: {
          routineId: routine.id,
          exerciseId:
            patient.id === carmen.id
              ? bandaRodilla.id
              : patient.id === javier.id
                ? bandaRodilla.id
                : patient.id === nuria.id
                  ? movilidadHombro.id
                  : fortalecimientoCore.id,
          prescription: "3 series de 12, 3 veces por semana",
          order: 2,
        },
      }),
    ]);

    const logCount = routineLogCounts[patient.id] ?? 0;
    for (let i = 0; i < logCount; i += 1) {
      await prisma.routineLog.create({
        data: {
          routineId: routine.id,
          routineItemId: items[i % items.length].id,
          loggedAt: new Date(at(9, 0).getTime() - i * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Seed completo.");
  console.log(`Terapeuta: ${therapistUser.email} / ${THERAPIST_PASSWORD}`);
  console.log(`Pacientes (misma contraseña): ${PATIENT_PASSWORD}`);
  console.log(`Cita "ahora": Lucía Ferrer a las ${luciaAppointment.startsAt.toISOString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
