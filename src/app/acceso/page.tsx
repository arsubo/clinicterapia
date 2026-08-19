"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui";

export default function AccesoPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Correo o contraseña incorrectos.");
      setIsSubmitting(false);
      return;
    }

    const session = await getSession();
    const destination = session?.user?.role === "PATIENT" ? "/portal" : "/app/agenda";
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ct-bg-page px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-ct-primary-soft font-heading text-lg font-semibold text-ct-primary-deep">
          P
        </div>

        <h1 className="font-heading text-3xl font-semibold text-ct-ink">
          Entra en tu consulta
        </h1>
        <p className="mt-2 text-sm text-ct-ink-muted">
          Expedientes, agenda y rutinas de fisioterapia en un solo sitio.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs text-ct-ink-muted">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="lucia@pauta.clinic"
              className="w-full rounded-xl border border-ct-border bg-ct-surface px-4 py-3 text-sm text-ct-ink placeholder:text-ct-ink-muted focus:border-ct-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs text-ct-ink-muted">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-ct-border bg-ct-surface px-4 py-3 text-sm text-ct-ink placeholder:text-ct-ink-muted focus:border-ct-primary focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <div className="mt-10 space-y-4 text-center text-sm">
          <a href="#" className="text-ct-primary-deep underline">
            He olvidado la contraseña
          </a>
          <hr className="border-ct-border" />
          <a href="#" className="text-ct-primary-deep underline">
            Soy paciente y quiero ver mi rutina
          </a>
        </div>
      </div>
    </div>
  );
}
