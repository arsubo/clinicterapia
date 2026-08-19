import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { PatientForm } from "@/components/pacientes/PatientForm";

export default function NuevoPacientePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <Link href="/app/pacientes" className="text-sm text-ct-ink-muted hover:text-ct-primary-deep">
        ← Pacientes
      </Link>
      <Eyebrow className="mt-4">Nuevo paciente</Eyebrow>
      <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink">
        Alta de paciente
      </h1>

      <div className="mt-6">
        <PatientForm />
      </div>
    </div>
  );
}
