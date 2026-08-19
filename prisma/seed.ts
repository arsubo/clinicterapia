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

  // Semana del mockup (assets/tablet_calendario_semana.png): lunes 17 a
  // sábado 22 de agosto de 2026. El entorno de desarrollo fija "hoy" en
  // miércoles 19, día que también cubre esta semana.
  const aug = (day: number, hour: number, minute: number) =>
    managuaDateTimeToUtc(2026, 8, day, hour, minute);

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: andres.id,
      startsAt: aug(17, 8, 30),
      status: "CONFIRMED",
      reasonLabel: "Lumbalgia · sesión 7 de 10",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: lucia.id,
      startsAt: aug(17, 10, 0),
      status: "CONFIRMED",
      reasonLabel: "Cervicalgia · sesión 5 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: javier.id,
      startsAt: aug(17, 11, 0),
      status: "SCHEDULED",
      reasonLabel: "Rodilla · postoperatorio · semana 4",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: nuria.id,
      startsAt: aug(17, 12, 0),
      durationMin: 60,
      status: "UNCONFIRMED",
      reasonLabel: "Fascitis · sesión 3 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: tomas.id,
      startsAt: aug(17, 16, 0),
      status: "CONFIRMED",
      reasonLabel: "Epicondilitis · alta prevista",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: carmen.id,
      startsAt: aug(17, 17, 30),
      status: "CONFIRMED",
      location: "HOME",
      address: carmen.homeAddress ?? undefined,
      travelMin: 18,
      reasonLabel: "Domicilio · C/ Salitre 14",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: tomas.id,
      startsAt: aug(18, 10, 0),
      status: "CONFIRMED",
      reasonLabel: "Epicondilitis · alta prevista",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: andres.id,
      startsAt: aug(18, 16, 30),
      status: "SCHEDULED",
      reasonLabel: "Lumbalgia · sesión 8 de 10",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: marta.id,
      startsAt: aug(19, 8, 30),
      status: "DONE",
      reasonLabel: "Hombro · seguimiento",
    },
  });

  const luciaAppointment = await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: lucia.id,
      startsAt: aug(19, 10, 30),
      status: "CONFIRMED",
      reasonLabel: "Cervicalgia · sesión 6 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: javier.id,
      startsAt: aug(19, 12, 30),
      status: "SCHEDULED",
      reasonLabel: "Rodilla · postoperatorio · semana 4",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: carmen.id,
      startsAt: aug(19, 17, 30),
      status: "CONFIRMED",
      location: "HOME",
      address: carmen.homeAddress ?? undefined,
      travelMin: 18,
      reasonLabel: "Domicilio · C/ Salitre 14",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: andres.id,
      startsAt: aug(20, 8, 30),
      status: "CONFIRMED",
      reasonLabel: "Lumbalgia · sesión 9 de 10",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: tomas.id,
      startsAt: aug(20, 16, 0),
      status: "CONFIRMED",
      reasonLabel: "Epicondilitis · alta prevista",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: nuria.id,
      startsAt: aug(21, 10, 0),
      status: "CONFIRMED",
      reasonLabel: "Fascitis · sesión 4 de 8",
    },
  });

  await prisma.calendarBlock.create({
    data: {
      therapistId: therapist.id,
      startsAt: aug(21, 17, 0),
      durationMin: 60,
      label: "Cierre de caja",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: marta.id,
      startsAt: aug(22, 12, 0),
      status: "CONFIRMED",
      reasonLabel: "Hombro · seguimiento",
    },
  });

  // Semana anterior y semana siguiente, para que la vista Mes tenga
  // contenido real más allá de la semana del mockup.
  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: andres.id,
      startsAt: aug(10, 8, 30),
      status: "DONE",
      reasonLabel: "Lumbalgia · sesión 5 de 10",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: lucia.id,
      startsAt: aug(12, 10, 0),
      status: "DONE",
      reasonLabel: "Cervicalgia · sesión 4 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: carmen.id,
      startsAt: aug(14, 17, 30),
      status: "DONE",
      location: "HOME",
      address: carmen.homeAddress ?? undefined,
      travelMin: 18,
      reasonLabel: "Domicilio · C/ Salitre 14",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: javier.id,
      startsAt: aug(24, 11, 0),
      status: "SCHEDULED",
      reasonLabel: "Rodilla · postoperatorio · semana 5",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: nuria.id,
      startsAt: aug(26, 12, 0),
      status: "SCHEDULED",
      reasonLabel: "Fascitis · sesión 5 de 8",
    },
  });

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      patientId: tomas.id,
      startsAt: aug(28, 16, 0),
      status: "SCHEDULED",
      reasonLabel: "Epicondilitis · alta prevista",
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

  async function createSessionHistory(
    patientId: string,
    totalPlanned: number,
    entries: { sequenceNo: number; daysAgo: number; painScore: number; note?: string }[],
  ) {
    return Promise.all(
      entries.map((entry) =>
        prisma.session.create({
          data: {
            patientId,
            occurredAt: daysAgo(entry.daysAgo),
            sequenceNo: entry.sequenceNo,
            totalPlanned,
            painScore: entry.painScore,
            note: entry.note,
          },
        }),
      ),
    );
  }

  await createSessionHistory(andres.id, 10, [
    { sequenceNo: 1, daysAgo: 35, painScore: 7 },
    { sequenceNo: 2, daysAgo: 28, painScore: 6 },
    { sequenceNo: 3, daysAgo: 21, painScore: 6 },
    { sequenceNo: 4, daysAgo: 14, painScore: 5 },
    { sequenceNo: 5, daysAgo: 7, painScore: 4 },
    {
      sequenceNo: 6,
      daysAgo: 0,
      painScore: 3,
      note: "Mejora sostenida. Reduce dolor irradiado a la pierna; se mantiene el trabajo de estabilización lumbar.",
    },
  ]);

  await createSessionHistory(javier.id, 12, [
    { sequenceNo: 1, daysAgo: 18, painScore: 8 },
    { sequenceNo: 2, daysAgo: 14, painScore: 7 },
    { sequenceNo: 3, daysAgo: 10, painScore: 7 },
    {
      sequenceNo: 4,
      daysAgo: 7,
      painScore: 6,
      note: "Semana 3 postoperatorio. Rango de flexión mejora, adherencia a la rutina sigue baja.",
    },
  ]);

  await createSessionHistory(nuria.id, 8, [
    {
      sequenceNo: 1,
      daysAgo: 7,
      painScore: 6,
      note: "Dolor matutino en el talón. Se añade estiramiento de fascia plantar antes de levantarse.",
    },
  ]);

  await createSessionHistory(tomas.id, 6, [
    { sequenceNo: 1, daysAgo: 50, painScore: 6 },
    { sequenceNo: 2, daysAgo: 40, painScore: 5 },
    { sequenceNo: 3, daysAgo: 30, painScore: 4 },
    { sequenceNo: 4, daysAgo: 20, painScore: 3 },
    {
      sequenceNo: 5,
      daysAgo: 10,
      painScore: 2,
      note: "Mejora notable, sin dolor a la palpación. Se prevé alta en la próxima cita.",
    },
  ]);

  await createSessionHistory(carmen.id, 10, [
    { sequenceNo: 1, daysAgo: 10, painScore: 6 },
    {
      sequenceNo: 2,
      daysAgo: 4,
      painScore: 5,
      note: "Mejora la tolerancia a la carga en domicilio. Se mantiene apoyo con andador para distancias largas.",
    },
  ]);

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
  console.log(`Semana del calendario: 17–22 de agosto de 2026 (hoy: miércoles 19).`);
  console.log(`Cita de Lucía Ferrer el miércoles: ${luciaAppointment.startsAt.toISOString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
