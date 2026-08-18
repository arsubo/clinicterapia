const colorTokens = [
  { name: "--ct-bg-page", label: "Fondo de página" },
  { name: "--ct-surface", label: "Superficie" },
  { name: "--ct-surface-soft", label: "Superficie suave" },
  { name: "--ct-rail-dark", label: "Rail oscuro" },
  { name: "--ct-primary", label: "Primario" },
  { name: "--ct-primary-deep", label: "Primario profundo" },
  { name: "--ct-primary-soft", label: "Primario suave" },
  { name: "--ct-ink", label: "Texto" },
  { name: "--ct-ink-muted", label: "Texto atenuado" },
  { name: "--ct-border", label: "Borde" },
  { name: "--ct-warn", label: "Advertencia" },
] as const;

export default function DesignPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
        Design system
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-4xl font-semibold">
        Tokens y tipografía
      </h1>
      <p className="mt-2 max-w-xl text-[color:var(--ct-ink-muted)]">
        Referencia visual para comparar contra los mockups en{" "}
        <code className="font-mono text-sm">assets/</code> antes de construir
        pantallas reales.
      </p>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold">
          Color
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {colorTokens.map((token) => (
            <div
              key={token.name}
              className="overflow-hidden rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)]"
            >
              <div
                className="h-16 w-full"
                style={{ background: `var(${token.name})` }}
              />
              <div className="p-3">
                <p className="text-sm font-medium">{token.label}</p>
                <p className="font-mono text-xs text-[color:var(--ct-ink-muted)]">
                  {token.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold">
          Tipografía
        </h2>
        <div className="mt-4 space-y-6 rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)] p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              Outfit — titulares
            </p>
            <p className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-semibold">
              Entra en tu consulta
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              Inter — cuerpo
            </p>
            <p className="mt-1 text-base">
              Expedientes, agenda y rutinas de fisioterapia en un solo sitio.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              IBM Plex Mono — horas y eyebrows
            </p>
            <p className="mt-1 font-mono text-2xl tracking-tight">08:30</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--ct-ink-muted)]">
              Lunes 17 de agosto
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
