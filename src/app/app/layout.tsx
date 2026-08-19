import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  const therapist = session?.user
    ? await prisma.therapist.findUnique({
        where: { userId: session.user.id },
        select: { id: true, fullName: true },
      })
    : null;

  const pendingAlertsCount = therapist
    ? await prisma.alert.count({
        where: { therapistId: therapist.id, resolvedAt: null },
      })
    : 0;

  return (
    <AppShell
      pendingAlertsCount={pendingAlertsCount}
      therapistName={therapist?.fullName ?? ""}
    >
      {children}
    </AppShell>
  );
}
