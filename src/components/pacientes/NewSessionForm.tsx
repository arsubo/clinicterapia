"use client";

import { useActionState, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { createSessionAction, type SessionFormState } from "@/app/app/pacientes/actions";

const initialState: SessionFormState = { errors: {}, values: {}, success: false };

const inputClass =
  "w-full rounded-xl border border-ct-border bg-ct-surface px-4 py-2.5 text-sm text-ct-ink placeholder:text-ct-ink-muted focus:border-ct-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs text-ct-ink-muted";

type NewSessionFormProps = {
  patientId: string;
  nextSequenceNo: number;
  defaultDate: string;
};

export function NewSessionForm({ patientId, nextSequenceNo, defaultDate }: NewSessionFormProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createSessionAction, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setFormKey((key) => key + 1);
    }
  }, [state.success]);

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        + Nueva sesión
      </Button>
    );
  }

  return (
    <Card>
      <form key={formKey} action={formAction} className="space-y-4">
        <input type="hidden" name="patientId" value={patientId} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="occurredAt" className={labelClass}>
              Fecha *
            </label>
            <input
              id="occurredAt"
              name="occurredAt"
              type="date"
              defaultValue={state.values.occurredAt ?? defaultDate}
              required
              className={inputClass}
            />
            {state.errors.occurredAt && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {state.errors.occurredAt}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sequenceNo" className={labelClass}>
              Número de sesión *
            </label>
            <input
              id="sequenceNo"
              name="sequenceNo"
              type="number"
              min={1}
              defaultValue={state.values.sequenceNo ?? nextSequenceNo}
              required
              className={inputClass}
            />
            {state.errors.sequenceNo && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {state.errors.sequenceNo}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="painScore" className={labelClass}>
              Dolor (0-10) *
            </label>
            <input
              id="painScore"
              name="painScore"
              type="number"
              min={0}
              max={10}
              defaultValue={state.values.painScore}
              required
              className={inputClass}
            />
            {state.errors.painScore && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {state.errors.painScore}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="rotationDeg" className={labelClass}>
              Rotación (grados)
            </label>
            <input
              id="rotationDeg"
              name="rotationDeg"
              type="number"
              min={0}
              defaultValue={state.values.rotationDeg}
              className={inputClass}
            />
            {state.errors.rotationDeg && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {state.errors.rotationDeg}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="note" className={labelClass}>
            Nota de sesión
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            defaultValue={state.values.note}
            className={inputClass}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Guardar sesión"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
