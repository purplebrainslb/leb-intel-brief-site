import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  Shield,
  Landmark,
  HeartPulse,
  Globe2,
  Activity,
  Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { briefingData } from "@/data/briefing";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Severity = "critical" | "high" | "medium" | "low";

const severityMeta: Record<
  Severity,
  { label: string; dot: string; text: string; ring: string; chip: string }
> = {
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    text: "text-red-300",
    ring: "ring-red-500/30",
    chip: "bg-red-500/10 text-red-300 border-red-500/30",
  },
  high: {
    label: "High",
    dot: "bg-orange-400",
    text: "text-orange-300",
    ring: "ring-orange-400/30",
    chip: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-400",
    text: "text-amber-300",
    ring: "ring-amber-400/30",
    chip: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  },
  low: {
    label: "Low",
    dot: "bg-sky-400",
    text: "text-sky-300",
    ring: "ring-sky-400/30",
    chip: "bg-sky-500/10 text-sky-200 border-sky-500/30",
  },
};

const assessmentChip: Record<string, string> = {
  "Unchanged/Deteriorating": "bg-red-500/10 text-red-300 border-red-500/30",
  "Unchanged/Impasse": "bg-amber-500/10 text-amber-200 border-amber-500/30",
  "More Likely to Deteriorate": "bg-red-500/10 text-red-300 border-red-500/30",
  "Elevated Risk": "bg-orange-500/10 text-orange-300 border-orange-500/30",
};

type TabDef = {
  value: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  accent: string;
};

const tabs: TabDef[] = [
  { value: "international", label: "International", shortLabel: "Intl", icon: Globe2, accent: "text-cyan-300" },
  { value: "military", label: "Military", shortLabel: "Military", icon: Shield, accent: "text-orange-300" },
  { value: "government", label: "Government", shortLabel: "Gov't", icon: Landmark, accent: "text-violet-300" },
  { value: "humanitarian", label: "Humanitarian", shortLabel: "Humanitarian", icon: HeartPulse, accent: "text-amber-300" },
  { value: "regional", label: "Regional", shortLabel: "Regional", icon: MapPin, accent: "text-emerald-300" },
  { value: "outlook", label: "30-Day Outlook", shortLabel: "Outlook", icon: TrendingUp, accent: "text-fuchsia-300" },
];

const sectionIndexByTab: Record<string, number> = {
  international: 0,
  military: 1,
  government: 2,
  humanitarian: 3,
  regional: 4,
};

function getSeverityCounts() {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const j of briefingData.keyJudgments) {
    counts[j.severity as Severity]++;
  }
  for (const section of briefingData.sections) {
    for (const item of section.items) {
      if (item.severity) counts[item.severity as Severity]++;
    }
  }
  return counts;
}

function formatBeirutTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Beirut",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatRelative(iso: string, nowMs: number) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Math.max(0, nowMs - d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("international");
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(getSeverityCounts, []);
  const totalItems = counts.critical + counts.high + counts.medium + counts.low;

  const relative = formatRelative(briefingData.lastUpdated, now);
  const currentBeirutTime = formatBeirutTime(new Date(now).toISOString());

  return (
    <div className="min-h-screen text-foreground intel-backdrop">
      {/* Decorative grid overlay */}
      <div className="pointer-events-none fixed inset-0 intel-grid" aria-hidden />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[oklch(0.11_0.018_255_/_0.78)] backdrop-blur-xl">
        <div className="container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <BrandMark />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white truncate">
                    Lebanon <span className="text-cyan-300">Daily Intelligence Brief</span>
                  </h1>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-400 font-mono mt-0.5">
                  Conflict tracking · {briefingData.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <LiveIndicator />
              <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {currentBeirutTime} <span className="text-slate-500">BEY</span>
                </span>
                <span className="text-slate-600">·</span>
                <span>Updated {relative}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container py-6 sm:py-10">
        {/* HERO — Key Insights */}
        <section className="relative">
          <div className="flex flex-col gap-3 mb-5 sm:mb-7">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-mono text-cyan-300/90">
                <span className="inline-block w-6 h-px bg-cyan-300/60" />
                Today's Brief
              </span>
              <span className="font-mono font-medium text-white tracking-tight text-xl sm:text-2xl lg:text-3xl">
                {briefingData.date}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.05]">
                Key Insights
                <span
                  className="block text-slate-400 text-base sm:text-lg mt-2"
                  style={{ fontFamily: "Verdana, Geneva, sans-serif" }}
                >
                  what mattered in the previous 24 hours
                </span>
              </h2>
              <SeverityLegend counts={counts} total={totalItems} />
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {briefingData.keyJudgments.map((j, idx) => (
              <InsightCard
                key={j.id}
                title={j.title}
                description={j.description}
                severity={j.severity as Severity}
                region={j.region}
                spotlight={idx === 0}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* SECTIONS — Tabbed */}
        <section className="mt-10 sm:mt-14">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-[11px] uppercase tracking-[0.18em] font-mono text-slate-400">
            <span className="inline-block w-6 h-px bg-slate-500/60" />
            Sections
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-[60px] sm:top-[68px] z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 bg-[oklch(0.11_0.018_255_/_0.78)] backdrop-blur-xl border-y border-white/[0.06] sm:rounded-xl sm:border sm:border-white/[0.08]">
              <TabsList className="no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 snap-x snap-mandatory">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.value;
                  return (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="snap-start shrink-0 group relative gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 transition-colors hover:text-white data-[state=active]:bg-white/[0.06] data-[state=active]:text-white data-[state=active]:shadow-none"
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? t.accent : "text-slate-500 group-hover:text-slate-300"}`} />
                      <span className="hidden sm:inline">{t.label}</span>
                      <span className="sm:hidden">{t.shortLabel}</span>
                      {isActive && (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute left-2 right-2 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="mt-5 sm:mt-7">
              {tabs.slice(0, 5).map((t) => {
                const sectionIdx = sectionIndexByTab[t.value];
                const section = briefingData.sections[sectionIdx];
                return (
                  <TabsContent key={t.value} value={t.value} className="m-0 outline-none">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={t.value}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <SectionHeader
                          icon={t.icon}
                          accent={t.accent}
                          title={section.title}
                          subtitle={section.subtitle}
                          count={section.items.length}
                        />
                        <div className="grid gap-2.5 sm:gap-3">
                          {section.items.map((item, idx) => (
                            <NewsRow
                              key={`${t.value}-${idx}`}
                              heading={item.heading}
                              content={item.content}
                              source={item.source}
                              severity={item.severity as Severity | undefined}
                              index={idx}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                );
              })}

              <TabsContent value="outlook" className="m-0 outline-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="outlook"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <SectionHeader
                      icon={TrendingUp}
                      accent="text-fuchsia-300"
                      title="30-Day Outlook"
                      subtitle="Forward assessment"
                      count={briefingData.outlook30Days.length}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {briefingData.outlook30Days.map((o, idx) => (
                        <OutlookCard
                          key={idx}
                          category={o.category}
                          assessment={o.assessment}
                          description={o.description}
                          index={idx}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* About / Data accuracy */}
        <section className="mt-12 sm:mt-16 grid gap-3 sm:gap-4 md:grid-cols-2">
          <FootNote
            icon={Info}
            title="About this brief"
            body="Compiled daily from major Lebanese outlets (Naharnet, L'Orient Today, LBCI, Al Jadeed, MTV Lebanon, NBN), international sources (Al Jazeera, Reuters, BBC, AP, UN) and regional analysts. Incidents tracked across Beirut, Dahieh, Mount Lebanon, the Metn, the north, the Bekaa and the south."
            accent="text-cyan-300"
          />
          <FootNote
            icon={AlertTriangle}
            title="Data accuracy"
            body="Unconfirmed items are flagged explicitly. The brief reflects the most current reporting available as of the morning update. Casualty figures, displacement numbers and military assessments come from official statements, UN agencies and credible media outlets."
            accent="text-amber-300"
          />
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06] mt-10 sm:mt-16">
        <div className="container py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
          <p>Lebanon Daily Intelligence Brief · Updated 07:00 Beirut time</p>
          <p>Data as of {briefingData.date}</p>
        </div>
      </footer>
    </div>
  );
}

/* ----------------------------- Components ----------------------------- */

function BrandMark() {
  return (
    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg glass-strong flex items-center justify-center shrink-0">
      <div className="absolute inset-0 rounded-lg ring-1 ring-cyan-300/20 pointer-events-none" />
      <Radio className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-cyan-300" strokeWidth={2.25} />
    </div>
  );
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
      <span className="relative inline-flex w-1.5 h-1.5">
        <span className="absolute inset-0 rounded-full bg-emerald-400 live-dot" />
      </span>
      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">Live</span>
    </div>
  );
}

function SeverityLegend({ counts, total }: { counts: Record<Severity, number>; total: number }) {
  const items: { sev: Severity; label: string }[] = [
    { sev: "critical", label: "Critical" },
    { sev: "high", label: "High" },
    { sev: "medium", label: "Medium" },
    { sev: "low", label: "Low" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <span className="text-slate-500">{total}</span>
        <span className="uppercase tracking-wider">tracked items</span>
      </div>
      <div className="h-3 w-px bg-white/10" />
      <div className="flex items-center gap-2 sm:gap-3">
        {items.map((i) => (
          <div key={i.sev} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${severityMeta[i.sev].dot}`} />
            <span className="text-[11px] font-mono text-slate-400">
              <span className={severityMeta[i.sev].text}>{counts[i.sev]}</span>{" "}
              <span className="hidden sm:inline">{i.label.toLowerCase()}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  description,
  severity,
  region,
  spotlight,
  index,
}: {
  title: string;
  description: string;
  severity: Severity;
  region: string;
  spotlight?: boolean;
  index: number;
}) {
  const meta = severityMeta[severity];
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative overflow-hidden rounded-xl glass p-4 sm:p-5 ${
        spotlight ? "lg:col-span-2 lg:row-span-1" : ""
      } transition-colors hover:bg-white/[0.05]`}
    >
      <span className={`sev-strip sev-${severity}`} aria-hidden />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 ${meta.chip}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} mr-1`} />
            {meta.label}
          </Badge>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{region}</span>
        </div>
      </div>
      <h3 className={`mt-3 pl-2 font-semibold text-white leading-snug ${spotlight ? "text-lg sm:text-2xl" : "text-base sm:text-lg"}`}>
        {title}
      </h3>
      <p className={`mt-2 pl-2 text-slate-300/90 leading-relaxed ${spotlight ? "text-sm sm:text-base" : "text-sm"}`}>
        {description}
      </p>
    </motion.article>
  );
}

function SectionHeader({
  icon: Icon,
  accent,
  title,
  subtitle,
  count,
}: {
  icon: LucideIcon;
  accent: string;
  title: string;
  subtitle?: string;
  count: number;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
        <div className={`mt-1 flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-lg glass`}>
          <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${accent}`} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider mt-0.5">
              {subtitle} · Last 24h
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
        <Activity className="w-3.5 h-3.5" />
        <span>{count} items</span>
      </div>
    </div>
  );
}

function NewsRow({
  heading,
  content,
  source,
  severity,
  index,
}: {
  heading: string;
  content: string;
  source: string;
  severity?: Severity;
  index: number;
}) {
  const sev = severity ?? "low";
  const meta = severityMeta[sev];
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: Math.min(index * 0.03, 0.18), ease: [0.23, 1, 0.32, 1] }}
      className="group relative overflow-hidden rounded-xl glass p-4 sm:p-5 transition-colors hover:bg-white/[0.045]"
    >
      <span className={`sev-strip sev-${sev}`} aria-hidden />
      <div className="pl-2.5 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[15px] sm:text-base font-semibold text-white leading-snug">{heading}</h4>
          <Badge
            variant="outline"
            className="shrink-0 text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-slate-300 border-white/10 px-1.5 py-0.5"
            title={`Source: ${source}`}
          >
            {source}
          </Badge>
        </div>
        <p className="text-sm text-slate-300/90 leading-relaxed">{content}</p>
        {severity && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            <span className={`text-[10px] font-mono uppercase tracking-wider ${meta.text}`}>{meta.label}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function OutlookCard({
  category,
  assessment,
  description,
  index,
}: {
  category: string;
  assessment: string;
  description: string;
  index: number;
}) {
  const chip = assessmentChip[assessment] ?? "bg-white/[0.04] text-slate-300 border-white/10";
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      className="group relative overflow-hidden rounded-xl glass p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base sm:text-lg font-semibold text-white tracking-tight">{category}</h4>
        <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider ${chip}`}>
          {assessment}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-slate-300/90 leading-relaxed">{description}</p>
    </motion.article>
  );
}

function FootNote({
  icon: Icon,
  title,
  body,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl glass p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex w-8 h-8 items-center justify-center rounded-md bg-white/[0.04] border border-white/10 shrink-0">
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="mt-1 text-[13px] text-slate-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
