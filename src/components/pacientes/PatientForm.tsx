"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { savePatientAction, type PatientFormState } from "@/app/app/pacientes/actions";

const initialState: PatientFormState = { errors: {}, values: {} };

const inputClass =
  "w-full rounded-xl border border-ct-border bg-ct-surface px-4 py-2.5 text-sm text-ct-ink placeholder:text-ct-ink-muted focus:border-ct-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs text-ct-ink-muted";

export type PatientFormInitialValues = {
  id: string;
  fullName: string;
  recordNo: string;
  age: number | null;
  homeAddress: string | null;
  status: "ACTIVE" | "DISCHARGED";
  diagnosis: string | null;
  phone: string | null;
  contactEmail: string | null;
  plannedSessions: number | null;
  notes: string | null;
  startedAtInput: string | null;
};

type PatientFormProps = {
  patient?: PatientFormInitialValues;
};

function Field({
  label,
  name,
  defaultValue,
  error,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function PatientForm({ patient }: PatientFormProps) {
  const [state, formAction, pending] = useActionState(savePatientAction, initialState);
  const values = state.values;

  function value(key: string, fallback?: string) {
    return values[key] ?? fallback ?? "";
  }

  return (
    <form action={formAction} className="space-y-4">
      {patient && <input type="hidden" name="id" value={patient.id} />}

      <Field
        label="Nombre completo"
        name="fullName"
        defaultValue={value("fullName", patient?.fullName)}
        error={state.errors.fullName}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Nº de expediente"
          name="recordNo"
          defaultValue={value("recordNo", patient?.recordNo)}
          error={state.errors.recordNo}
          required
        />
        <Field
          label="Edad"
          name="age"
          type="number"
          defaultValue={value("age", patient?.age?.toString())}
          error={state.errors.age}
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={value("status", patient?.status ?? "ACTIVE")}
          className={inputClass}
        >
          <option value="ACTIVE">Activo</option>
          <option value="DISCHARGED">Alta</option>
        </select>
      </div>

      <Field
        label="Diagnóstico"
        name="diagnosis"
        defaultValue={value("diagnosis", patient?.diagnosis ?? undefined)}
        placeholder="Cervicalgia postural"
      />

      <Field
        label="Dirección de domicilio"
        name="homeAddress"
        defaultValue={value("homeAddress", patient?.homeAddress ?? undefined)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Teléfono"
          name="phone"
          defaultValue={value("phone", patient?.phone ?? undefined)}
        />
        <Field
          label="Correo de contacto"
          name="contactEmail"
          type="email"
          defaultValue={value("contactEmail", patient?.contactEmail ?? undefined)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Sesiones planificadas"
          name="plannedSessions"
          type="number"
          defaultValue={value("plannedSessions", patient?.plannedSessions?.toString())}
          error={state.errors.plannedSessions}
        />
        <Field
          label="Fecha de inicio"
          name="startedAt"
          type="date"
          defaultValue={value("startedAt", patient?.startedAtInput ?? undefined)}
          error={state.errors.startedAt}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={value("notes", patient?.notes ?? undefined)}
          className={inputClass}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
