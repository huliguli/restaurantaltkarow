import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getConsentOverview,
  getDailySeries,
  getFunnel,
  getHourBuckets,
  getOverviewKpis,
  getRecentEvents,
  getReturningSplit,
  getTopByGroup,
  getTopCtas,
  getTopPages,
  getTopReferrers,
  getWeekdayBuckets,
  resolveRange,
  type Period,
} from "@/lib/analytics/aggregations";
import { AdminNav } from "@/components/AdminNav";
import { BarRow } from "@/components/admin/charts/BarRow";
import { TimeSeries } from "@/components/admin/charts/TimeSeries";
import { HourHeatmap } from "@/components/admin/charts/HourHeatmap";

export const metadata: Metadata = {
  title: "Admin · Analytics",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Heute" },
  { id: "7d", label: "7 Tage" },
  { id: "30d", label: "30 Tage" },
  { id: "90d", label: "90 Tage" },
];

function fmtN(n: number) {
  return new Intl.NumberFormat("de-DE").format(n);
}
function fmtPct(n: number) {
  return `${n.toFixed(1).replace(".", ",")} %`;
}
function fmtDur(ms: number) {
  if (!ms) return "0 s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")} min`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const period = (
    ["today", "7d", "30d", "90d"].includes(params.period ?? "")
      ? params.period
      : "30d"
  ) as Period;

  const range = resolveRange(period);

  const kpis = getOverviewKpis(range);
  const series = getDailySeries(range);
  const pages = getTopPages(range, 8);
  const referrers = getTopReferrers(range, 8);
  const ctas = getTopCtas(range, 8);
  const devices = getTopByGroup(range, "device_type");
  const browsers = getTopByGroup(range, "browser");
  const osList = getTopByGroup(range, "os");
  const langs = getTopByGroup(range, "language");
  const hours = getHourBuckets(range);
  const weekdays = getWeekdayBuckets(range);
  const returning = getReturningSplit(range);
  const funnel = getFunnel(range);
  const consents = getConsentOverview(range);
  const recent = getRecentEvents(range, 30);

  return (
    <section className="min-h-[100svh] bg-paper py-28">
      <div className="container-wide">
        <AdminNav username={session.sub} />

        {/* Zeitraum-Wahl */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-sm text-muted mr-2 uppercase tracking-wider">
            Zeitraum
          </span>
          {PERIODS.map((p) => {
            const active = p.id === period;
            return (
              <Link
                key={p.id}
                href={`/admin/analytics?period=${p.id}`}
                className={`px-4 py-2 text-sm tracking-wide border transition-colors ${
                  active
                    ? "bg-burgundy border-burgundy text-paper"
                    : "bg-paper border-ink/20 text-ink hover:border-burgundy"
                }`}
              >
                {p.label}
              </Link>
            );
          })}
          {kpis.visits === 0 ? (
            <span className="ml-auto text-xs italic text-muted">
              Noch keine Daten in diesem Zeitraum.
            </span>
          ) : null}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Kpi label="Sessions" value={fmtN(kpis.visits)} />
          <Kpi label="Unique Visitors" value={fmtN(kpis.uniqueVisitors)} />
          <Kpi label="Pageviews" value={fmtN(kpis.pageviews)} />
          <Kpi label="Ø Sitzungsdauer" value={fmtDur(kpis.avgSessionMs)} />
          <Kpi
            label="Absprungrate"
            value={fmtPct(kpis.bounceRatePct)}
            sub="Sessions mit 1 Seite"
          />
          <Kpi
            label="Form-Starts"
            value={fmtN(kpis.formStarts)}
            sub={`davon abgeschickt: ${fmtN(kpis.formSubmits)}`}
          />
          <Kpi
            label="Conversion"
            value={fmtPct(kpis.conversionPct)}
            sub="Form-Submit pro Session"
          />
          <Kpi
            label="Consent-Akzeptanz"
            value={fmtPct(kpis.consentAnalyticsRatePct)}
            sub={`${kpis.consentRecords} Entscheidung(en)`}
          />
        </div>

        {/* Zeitserie */}
        <Section title="Tägliche Zugriffe">
          <TimeSeries points={series} />
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Section title="Top-Seiten">
            <BarRow rows={pages} emptyLabel="Noch keine Pageviews" />
          </Section>
          <Section title="Top-Verweise (Referrer)">
            <BarRow rows={referrers} />
          </Section>
          <Section title="Top-CTAs">
            <BarRow rows={ctas} emptyLabel="Noch keine CTA-Klicks" />
          </Section>
          <Section title="Funnel">
            <BarRow
              rows={funnel.map((f) => ({ key: f.label, count: f.count }))}
            />
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Section title="Geräte">
            <BarRow rows={devices} />
          </Section>
          <Section title="Browser">
            <BarRow rows={browsers} />
          </Section>
          <Section title="Betriebssysteme">
            <BarRow rows={osList} />
          </Section>
          <Section title="Sprachen">
            <BarRow rows={langs} />
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Section title="Stunden-Heatmap (Sessions)">
            <HourHeatmap hours={hours} />
          </Section>
          <Section title="Wochentage">
            <BarRow
              rows={weekdays.map((w) => ({ key: w.label, count: w.count }))}
            />
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Section title="Neu vs. wiederkehrend">
            <BarRow
              rows={[
                { key: "Neue Besucher", count: returning.newVisitors },
                {
                  key: "Wiederkehrende",
                  count: returning.returningVisitors,
                },
              ]}
            />
          </Section>
          <Section title="Consent-Übersicht">
            <BarRow
              rows={[
                { key: "Gesamt", count: consents.total },
                { key: "Analytics ✓", count: consents.acceptedAnalytics },
                { key: "Funktional ✓", count: consents.acceptedFunctional },
                { key: "Marketing ✓", count: consents.acceptedMarketing },
                { key: "Widerrufen", count: consents.withdrawn },
              ]}
            />
          </Section>
        </div>

        <Section title="Aktuelle Events">
          {recent.length === 0 ? (
            <p className="text-ink-soft italic text-sm">
              Noch keine Events erfasst.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-ink/15 text-left">
                    <Th>Zeit</Th>
                    <Th>Typ</Th>
                    <Th>Pfad</Th>
                    <Th>CTA / Form</Th>
                    <Th>Gerät</Th>
                    <Th>Land</Th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id} className="border-b border-ink/8">
                      <Td className="text-xs tabular-nums text-muted">
                        {new Date(e.created_at).toLocaleString("de-DE")}
                      </Td>
                      <Td>
                        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-burgundy">
                          {e.type}
                        </span>
                      </Td>
                      <Td className="text-xs">{e.page_path ?? "—"}</Td>
                      <Td className="text-xs">
                        {e.cta_id ?? e.form_id ?? "—"}
                      </Td>
                      <Td className="text-xs">{e.device_type ?? "—"}</Td>
                      <Td className="text-xs">{e.country ?? "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-paper-deep/30 border border-ink/10 p-5">
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted" style={{ fontWeight: 700 }}>
        {label}
      </p>
      <p
        className="mt-2 font-serif text-3xl text-ink-strong tabular-nums"
        style={{ fontWeight: 700 }}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper-deep/30 border border-ink/10 p-6 sm:p-8 shadow-soft">
      <h2
        className="font-serif text-xl text-ink-strong mb-5"
        style={{ fontWeight: 700 }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      className="px-3 py-2 font-sans text-[0.68rem] tracking-[0.18em] uppercase text-muted"
      style={{ fontWeight: 700 }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 align-top text-ink ${className}`}>{children}</td>
  );
}
