"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui";
import {
  createAppointment,
  updateAppointment,
  type AppointmentFormState,
} from "@/app/app/calendario/actions";

const initialState: AppointmentFormState = { errors: {}, values: {} };

const inputClass =
  "w-full rounded-xl border border-ct-border bg-ct-surface px-4 py-2.5 text-sm text-ct-ink placeholder:text-ct-ink-muted focus:border-ct-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs text-ct-ink-muted";

export type AppointmentFormInitialValues = {
  id: string;
  patientId: string;
  fecha: string;
  hora: string;
  durationMin: number;
  location: "CLINIC" | "HOME";
  address: string | null;
  travelMin: number | null;
  reasonLabel: string;
};

type AppointmentFormProps = {
  patients: { id: string; fullName: string }[];
  appointment?: AppointmentFormInitialValues;
  defaultPatientId?: string;
  defaultFecha?: string;
  defaultHora?: string;
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

function departureTime(hora: string, travelMin: string): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hora);
  const minutes = Number(travelMin);
  if (!match || !Number.isInteger(minutes) || minutes <= 0) return null;

  const totalMinutes = Number(match[1]) * 60 + Number(match[2]) - minutes;
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function AppointmentForm({
  patients,
  appointment,
  defaultPatientId,
  defaultFecha,
  defaultHora,
}: AppointmentFormProps) {
  const action = appointment ? updateAppointment : createAppointment;
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values;

  function value(key: string, fallback?: string) {
    return values[key] ?? fallback ?? "";
  }

  const [location, setLocation] = useState<"CLINIC" | "HOME">(
    (value("location", appointment?.location) as "CLINIC" | "HOME") || "CLINIC",
  );
  const [hora, setHora] = useState(value("hora", appointment?.hora ?? defaultHora));
  const [travelMin, setTravelMin] = useState(value("travelMin", appointment?.travelMin?.toString()));

  const departure = location === "HOME" ? departureTime(hora, travelMin) : null;

  return (
    <form action={formAction} className="space-y-4">
      {appointment && <input type="hidden" name="id" value={appointment.id} />}

      {state.errors.overlap && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {state.errors.overlap}
        </p>
      )}

      <div>
        <label htmlFor="patientId" className={labelClass}>
          Paciente *
        </label>
        <select
          id="patientId"
          name="patientId"
          defaultValue={value("patientId", appointment?.patientId ?? defaultPatientId)}
          className={inputClass}
          required
        >
          <option value="" disabled>
            Selecciona un paciente
          </option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName}
            </option>
          ))}
        </select>
        {state.errors.patientId && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {state.errors.patientId}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Fecha"
          name="fecha"
          type="date"
          defaultValue={value("fecha", appointment?.fecha ?? defaultFecha)}
          error={state.errors.fecha}
          required
        />
        <div>
          <label htmlFor="hora" className={labelClass}>
            Hora *
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            value={hora}
            onChange={(event) => setHora(event.target.value)}
            className={inputClass}
            required
          />
          {state.errors.hora && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {state.errors.hora}
            </p>
          )}
        </div>
      </div>

      <Field
        label="Duración (min)"
        name="durationMin"
        type="number"
        defaultValue={value("durationMin", (appointment?.durationMin ?? 45).toString())}
        error={state.errors.durationMin}
      />

      <div>
        <label htmlFor="location" className={labelClass}>
          Ubicación
        </label>
        <select
          id="location"
          name="location"
          value={location}
          onChange={(event) => setLocation(event.target.value as "CLINIC" | "HOME")}
          className={inputClass}
        >
          <option value="CLINIC">En consulta</option>
          <option value="HOME">A domicilio</option>
        </select>
      </div>

      {location === "HOME" && (
        <>
          <Field
            label="Dirección"
            name="address"
            defaultValue={value("address", appointment?.address ?? undefined)}
            placeholder="C/ Salitre 14, 2°B"
          />
          <div>
            <label htmlFor="travelMin" className={labelClass}>
              Tiempo de viaje (min)
            </label>
            <input
              id="travelMin"
              name="travelMin"
              type="number"
              value={travelMin}
              onChange={(event) => setTravelMin(event.target.value)}
              className={inputClass}
            />
            {state.errors.travelMin && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {state.errors.travelMin}
              </p>
            )}
            {departure && <p className="mt-1 text-xs text-ct-ink-muted">Salir a las {departure}</p>}
          </div>
        </>
      )}

      <div>
        <label htmlFor="reasonLabel" className={labelClass}>
          Motivo *
        </label>
        <input
          id="reasonLabel"
          name="reasonLabel"
          defaultValue={value("reasonLabel", appointment?.reasonLabel)}
          placeholder="Cervicalgia · sesión 5 de 8"
          className={inputClass}
          required
        />
        {state.errors.reasonLabel && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {state.errors.reasonLabel}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
