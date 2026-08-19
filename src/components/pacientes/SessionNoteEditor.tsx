"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { updateSessionNoteAction, type SessionNoteFormState } from "@/app/app/pacientes/actions";

const initialState: SessionNoteFormState = { success: false };

type SessionNoteEditorProps = {
  sessionId: string;
  note: string | null;
};

export function SessionNoteEditor({ sessionId, note }: SessionNoteEditorProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateSessionNoteAction, initialState);

  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state.success]);

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ct-ink-muted">{note || "Sin nota."}</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 text-xs font-medium text-ct-primary-deep hover:underline"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <textarea
        name="note"
        rows={3}
        defaultValue={note ?? ""}
        className="w-full rounded-xl border border-ct-border bg-ct-surface px-3 py-2 text-sm text-ct-ink focus:border-ct-primary focus:outline-none"
      />
      {state.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Guardar nota"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
