import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  SectionHeader,
  StatTile,
  StatusPill,
} from "@/components/ui";
import {
  addDaysManagua,
  formatMonthYearManagua,
  startOfMonthManagua,
  startOfWeekManagua,
  weekNumberManagua,
} from "@/lib/datetime";

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

const REFERENCE_DATE = { year: 2026, month: 8, day: 19 };

export default function DesignPage() {
  const weekStart = startOfWeekManagua(REFERENCE_DATE);
  const weekEnd = addDaysManagua(weekStart, 5);
  const monthStart = startOfMonthManagua(REFERENCE_DATE);

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

      <section className="mt-12">
        <SectionHeader title="Eyebrow" />
        <div className="mt-4 rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)] p-6">
          <Eyebrow>Lunes 17 de agosto</Eyebrow>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Botones" />
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)] p-6">
          <Button variant="primary">Entrar</Button>
          <Button variant="primary" size="sm">
            Abrir ficha
          </Button>
          <Button variant="secondary">Nota rápida</Button>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Pills de estado" />
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)] p-6">
          <StatusPill tone="neutral">Hecha</StatusPill>
          <StatusPill tone="primary">Confirmada</StatusPill>
          <StatusPill tone="primary">Domicilio</StatusPill>
          <StatusPill tone="outline">Sin confirmar</StatusPill>
          <StatusPill tone="warn">Dolor al alza</StatusPill>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Avatares" />
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)] p-6">
          <Avatar initials="AM" />
          <Avatar initials="MS" />
          <Avatar initials="LF" tone="primary" />
          <Avatar initials="P" tone="primary" size="sm" />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Tarjetas y StatTiles" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Sesiones hoy" value="7" caption="2 terminadas · 1 en curso" />
          <StatTile
            label="Adherencia media"
            value="81%"
            trend="+4"
            progress={81}
          />
          <StatTile
            label="Requieren atención"
            value="4"
            caption="Ver la bandeja"
            tone="highlight"
          />
        </div>
        <Card className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials="LF" tone="primary" />
            <div>
              <p className="text-sm font-medium">Lucía Ferrer</p>
              <p className="text-xs text-[color:var(--ct-ink-muted)]">
                Cervicalgia · sesión 4 de 8
              </p>
            </div>
          </div>
          <StatusPill tone="outline">Abrir</StatusPill>
        </Card>
      </section>

      <section className="mt-12">
        <SectionHeader title="Fechas — helpers de periodo" />
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-[color:var(--ct-border)] bg-[color:var(--ct-surface)] p-6 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              Referencia
            </p>
            <p className="mt-1 text-sm">19 de agosto de 2026</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              startOfWeekManagua
            </p>
            <p className="mt-1 text-sm">
              {weekStart.day}/{weekStart.month}/{weekStart.year} (debe ser lunes 17)
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              addDaysManagua (+5 desde el lunes)
            </p>
            <p className="mt-1 text-sm">
              {weekEnd.day}/{weekEnd.month}/{weekEnd.year} (debe ser sábado 22)
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              startOfMonthManagua
            </p>
            <p className="mt-1 text-sm">
              {monthStart.day}/{monthStart.month}/{monthStart.year}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              formatMonthYearManagua
            </p>
            <p className="mt-1 text-sm">{formatMonthYearManagua(REFERENCE_DATE)}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ct-ink-muted)]">
              weekNumberManagua
            </p>
            <p className="mt-1 text-sm">{weekNumberManagua(REFERENCE_DATE)}</p>
          </div>
        </div>
      </section>

      <section className="mt-12 mb-12">
        <SectionHeader title="Estado vacío" />
        <div className="mt-4">
          <EmptyState
            title="Sin citas para hoy"
            description="Cuando agendes una cita para el terapeuta, aparecerá aquí."
            action={<Button size="sm">Agendar cita</Button>}
          />
        </div>
      </section>
    </div>
  );
}
