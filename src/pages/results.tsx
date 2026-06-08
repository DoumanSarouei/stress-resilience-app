import { useEffect, useState } from "react";

type Fields = Record<string, unknown>;

interface ApiResponse {
  id: string;
  fields: Fields;
}

interface ApiError {
  error: string;
}

function asString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(asString).filter(Boolean).join(", ");
  return String(v);
}

function firstNonEmpty(...values: string[]): string {
  return (
    values.find((v) => typeof v === "string" && v.trim().length > 0)?.trim() ?? ""
  );
}

function isNoMajorNeed(need: string): boolean {
  const n = need.trim().toLowerCase();
  return n === "no major unmet need" || n === "no_major_gap" || n === "no major gap" || n === "no major need";
}

function formatNeed(need: string): string {
  if (!need) return "";
  const map: Record<string, string> = {
    CONN: "Connection",
    AUTO: "Autonomy / Control",
    COMP: "Competence / Effectiveness",
    RECOG: "Recognition / Value",
    MEAN: "Meaning / Purpose",
    SEC: "Security / Stability",
    GROW: "Growth / Development",
    REC: "Recovery",
    RECOVERY: "Recovery",
    NO_MAJOR_GAP: "No major unmet need",
    NO_MAJOR_NEED: "No major unmet need",
  };
  return map[need.trim().toUpperCase()] ?? need;
}

function formatPattern(pattern: string): string {
  if (!pattern) return "—";
  const map: Record<string, string> = {
    EFFORT_REWARD_STRAIN: "Effort Reward Strain",
    OVERLOAD_RECOVERY_DEFICIT: "Overload Recovery Deficit",
    CONTROL_UNCERTAINTY_STRAIN: "Control Uncertainty Strain",
    THREAT_ANXIETY_STRAIN: "Threat Anxiety Strain",
    RELATIONAL_SUPPORT_DEFICIT: "Relational Support Deficit",
    MEANING_VALUE_MISALIGNMENT: "Meaning Value Misalignment",
    RESOURCE_DEPLETION: "Resource Depletion",
    NO_CLEAR_PATTERN: "No Clear Pattern",
  };
  return (
    map[pattern.trim().toUpperCase()] ??
    pattern.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function patternAnchor(pattern: string): string {
  const p = pattern.toUpperCase();
  if (p.includes("MEANING")) return "You may not be overloaded — you may be under-connected to meaning.";
  if (p.includes("OVERLOAD")) return "You may not be failing — your system may simply be overloaded.";
  if (p.includes("CONTROL")) return "You may not be weak — you may be carrying too little control.";
  if (p.includes("RELATIONAL") || p.includes("CONNECTION")) return "You may not be too sensitive — your stress may be relationally driven.";
  if (p.includes("EFFORT") || p.includes("REWARD")) return "Your stress may not come from doing too much, but from a mismatch between effort and return.";
  if (p.includes("THREAT") || p.includes("ANXIETY")) return "Your system may be working hard to protect you — even when the threat is not immediate.";
  if (p.includes("RESOURCE")) return "Your capacity to cope may be lower than usual right now — not because of weakness, but depletion.";
  return "Your current result reflects a real pattern, not a personal flaw.";
}

function defaultKeyInsight(pattern: string): string {
  const p = pattern.toUpperCase();
  if (p.includes("EFFORT") || p.includes("REWARD")) {
    return "Your stress may not only come from doing too much, but from a mismatch between what you invest and what comes back as recognition, support, fairness, or emotional return.";
  }
  if (p.includes("OVERLOAD")) {
    return "Sustained demand without sufficient recovery gradually depletes the resources needed to think clearly, regulate emotions, and stay resilient.";
  }
  if (p.includes("CONTROL") || p.includes("UNCERTAINTY")) {
    return "When control feels low, the nervous system stays on alert — scanning for threats and consuming energy that would otherwise go to focus and recovery.";
  }
  if (p.includes("RELATIONAL") || p.includes("CONNECTION")) {
    return "Interpersonal stress is often underestimated. Unresolved relational tension or the absence of genuine support can quietly sustain a stress response.";
  }
  if (p.includes("MEANING")) {
    return "Functioning without a sense of meaning or direction is a quiet but persistent stressor. Motivation, engagement, and resilience all depend partly on feeling that effort has purpose.";
  }
  if (p.includes("THREAT") || p.includes("ANXIETY")) {
    return "When the mind stays oriented toward potential threats, it uses resources continuously — even when no immediate danger is present.";
  }
  if (p.includes("RESOURCE")) {
    return "When resources are depleted, ordinary demands require more effort than usual. The priority is protecting and rebuilding capacity — not pushing through.";
  }
  return "Your current result reflects a meaningful pattern. Understanding what drives it is the first step toward targeted recovery.";
}

function startHereText(pattern: string): string {
  const p = pattern.toUpperCase();
  if (p.includes("MEANING")) return "Do not begin with productivity. Begin with reconnection: what feels personally meaningful right now?";
  if (p.includes("OVERLOAD")) return "Do not begin with optimization. Begin with recovery: reduce load before asking more from yourself.";
  if (p.includes("CONTROL")) return "Do not begin with perfection. Begin with control: identify one area where you can influence the next step.";
  if (p.includes("RELATIONAL") || p.includes("CONNECTION")) return "Do not begin with fixing everything. Begin with one honest relational need or one safe supportive contact.";
  if (p.includes("EFFORT") || p.includes("REWARD")) return "Begin by identifying one area where your effort is not being fairly matched — and consider what a small rebalance could look like.";
  if (p.includes("THREAT") || p.includes("ANXIETY")) return "Begin with safety and grounding, not problem-solving. What helps your system settle?";
  if (p.includes("RESOURCE")) return "Begin with restoration, not performance. What is the smallest act of recovery available to you today?";
  return "Begin with the smallest next step that reduces stress and increases clarity.";
}

type LoopStep = { step: number; text: string };

function getStressLoop(pattern: string): LoopStep[] {
  const p = pattern.toUpperCase();

  if (p.includes("EFFORT") || p.includes("REWARD")) {
    return [
      { step: 1, text: "High effort / responsibility" },
      { step: 2, text: "Not enough recognition, reciprocity, or felt value" },
      { step: 3, text: "Emotional strain, worry, or reduced recovery" },
      { step: 4, text: "Trying harder, overthinking, or withdrawing" },
      { step: 5, text: "More effort without enough return" },
    ];
  }
  if (p.includes("OVERLOAD")) {
    return [
      { step: 1, text: "High demands" },
      { step: 2, text: "Too little recovery" },
      { step: 3, text: "Fatigue, tension, or reduced focus" },
      { step: 4, text: "Pushing through or postponing rest" },
      { step: 5, text: "Recovery debt increases" },
    ];
  }
  if (p.includes("CONTROL") || p.includes("UNCERTAINTY")) {
    return [
      { step: 1, text: "Unclear influence or limited control" },
      { step: 2, text: "More monitoring and planning" },
      { step: 3, text: "Mental load increases" },
      { step: 4, text: "Decisions feel harder" },
      { step: 5, text: "Uncertainty stays active" },
    ];
  }
  if (p.includes("THREAT") || p.includes("ANXIETY")) {
    return [
      { step: 1, text: "Situation feels risky or uncertain" },
      { step: 2, text: "Attention scans for what could go wrong" },
      { step: 3, text: "Worry and body tension increase" },
      { step: 4, text: "Avoidance, checking, or reassurance seeking" },
      { step: 5, text: "Threat feeling stays alive" },
    ];
  }
  if (p.includes("RELATIONAL") || p.includes("CONNECTION")) {
    return [
      { step: 1, text: "Need for support or connection" },
      { step: 2, text: "Support feels insufficient or unclear" },
      { step: 3, text: "Disappointment, loneliness, or sensitivity rises" },
      { step: 4, text: "Withdrawal or over-adaptation" },
      { step: 5, text: "Connection need remains unmet" },
    ];
  }
  if (p.includes("MEANING")) {
    return [
      { step: 1, text: "Daily effort feels disconnected from values" },
      { step: 2, text: "Motivation drops" },
      { step: 3, text: "Tasks feel empty or repetitive" },
      { step: 4, text: "Disengagement or delay" },
      { step: 5, text: "Meaning gap remains active" },
    ];
  }
  if (p.includes("RESOURCE")) {
    return [
      { step: 1, text: "Resources are already reduced" },
      { step: 2, text: "Normal demands feel more costly" },
      { step: 3, text: "Recovery becomes less efficient" },
      { step: 4, text: "Less energy for coping" },
      { step: 5, text: "Depletion continues" },
    ];
  }
  return [
    { step: 1, text: "Ongoing pressure or unmet need" },
    { step: 2, text: "Reduced capacity to respond" },
    { step: 3, text: "Stress response stays active" },
    { step: 4, text: "Coping becomes less effective" },
    { step: 5, text: "Pattern reinforces itself" },
  ];
}

function truncateToTwoSentences(text: string): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  if (sentences.length <= 2) return text.trim();
  return sentences.slice(0, 2).join(" ").trim();
}

function isSafePressureSource(raw: string): boolean {
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v !== "" && v !== "press" && v !== "empty" && v !== "null" && v !== "undefined" && v !== "n/a" && v !== "-";
}

type ChartItem = { label: string; value: number };

function safeNum(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatReportDate(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function toGapPct(raw: number): number {
  return Math.round(Math.min(Math.max((raw / 4) * 100, 0), 100));
}

function toResourcePct(raw: number): number {
  return Math.round(Math.min(Math.max(((raw - 1) / 4) * 100, 0), 100));
}

function buildNeedGapItems(get: (k: string) => string): ChartItem[] {
  return [
    { label: "Connection", value: toGapPct(safeNum(get("gap_conn"))) },
    { label: "Autonomy", value: toGapPct(safeNum(get("gap_auto"))) },
    { label: "Competence", value: toGapPct(safeNum(get("gap_comp"))) },
    { label: "Recovery", value: toGapPct(safeNum(get("gap_rec"))) },
    { label: "Meaning", value: toGapPct(safeNum(get("gap_mean"))) },
    { label: "Security", value: toGapPct(safeNum(get("gap_sec"))) },
    { label: "Growth", value: toGapPct(safeNum(get("gap_grow"))) },
  ];
}

function buildResourceItems(get: (k: string) => string): ChartItem[] {
  return [
    { label: "Coping capacity", value: toResourcePct(safeNum(get("r_int_score"))) },
    { label: "Physical", value: toResourcePct(safeNum(get("r_phy_score"))) },
    { label: "Social", value: toResourcePct(safeNum(get("r_soc_score"))) },
    { label: "Structural", value: toResourcePct(safeNum(get("r_str_score"))) },
    { label: "Meaning", value: toResourcePct(safeNum(get("r_mean_score"))) },
  ];
}

function getHighestItem(items: ChartItem[]): ChartItem | null {
  if (!items.length) return null;
  return items.reduce((max, item) => (item.value > max.value ? item : max), items[0]!);
}

function getLowestItem(items: ChartItem[]): ChartItem | null {
  if (!items.length) return null;
  return items.reduce((min, item) => (item.value < min.value ? item : min), items[0]!);
}

function InsightChartCard({ title, subtitle, items, type }: {
  title: string; subtitle: string; items: ChartItem[]; type: "gap" | "resource";
}) {
  const emphasisItem = type === "gap" ? getHighestItem(items) : getLowestItem(items);
  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="text-[15px] font-bold text-[#0f172a] mb-0.5">{title}</div>
      <div className="text-[12.5px] text-slate-400 mb-4">{subtitle}</div>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const isEmphasis = emphasisItem?.label === item.label;
          const fillColor = type === "gap" ? "bg-amber-500" : "bg-slate-400";
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className={`text-[13px] font-semibold ${isEmphasis ? "text-slate-900" : "text-slate-600"}`}>{item.label}</span>
                <span className="text-[12px] text-slate-400 tabular-nums">{item.value}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${fillColor} ${isEmphasis ? "opacity-100" : "opacity-70"}`}
                  style={{ width: `${Math.max(item.value, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HowToReadToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[11.5px] text-slate-400 hover:text-slate-500 transition-colors cursor-pointer bg-transparent border-none p-0 select-none"
      >
        How to read this <span className="text-[9px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <p className="m-0 mt-1.5 text-[11.5px] leading-[1.6] text-slate-400">
          Gap % = how strongly a need is currently unmet (higher = bigger imbalance).
          Resource % = how available that support area feels right now (lower = weaker).
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 sm:p-7 mb-5">
      <h2 className="text-[19px] leading-tight text-[#0f172a] font-bold tracking-[-0.01em] m-0 mb-4">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function CompactCard({ title, text }: { title: string; text: string }) {
  if (!text || !text.trim()) return null;
  return (
    <div className="bg-slate-50 ring-1 ring-slate-100 rounded-xl p-3.5">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 mb-1">{title}</div>
      <div className="text-[14px] leading-[1.6] text-slate-700">{text}</div>
    </div>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  if (!children || (typeof children === "string" && !children.trim())) return null;
  return (
    <div className="relative bg-slate-50 ring-1 ring-slate-200 border-l-2 border-blue-400 rounded-r-xl px-5 py-4 pl-12">
      <span aria-hidden="true" className="absolute top-1 left-3.5 text-[52px] leading-none font-serif text-slate-300 opacity-30 select-none pointer-events-none">"</span>
      <div className="text-[16px] leading-[1.75] text-slate-700 italic">{children}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
        <span className="text-sm">Loading your result…</span>
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">We couldn't load your result</h1>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function RecommendationCard({ num, title, target, why, how, timeFrame, difficulty }: {
  num: number; title: string; target?: string; why?: string; how?: string; timeFrame?: string; difficulty?: string;
}) {
  if (!title) return null;
  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
          {num}
        </span>
        <div>
          <div className="text-[15px] font-bold text-slate-900 leading-snug">{title}</div>
          {target && <div className="text-[12px] text-blue-600 font-semibold mt-0.5">{target}</div>}
        </div>
      </div>
      {why && (
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 mb-0.5">Why</div>
          <div className="text-[13.5px] leading-[1.6] text-slate-600">{why}</div>
        </div>
      )}
      {how && (
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 mb-0.5">How</div>
          <div className="text-[13.5px] leading-[1.6] text-slate-600">{how}</div>
        </div>
      )}
      {(timeFrame || difficulty) && (
        <div className="flex gap-1.5 flex-wrap pt-0.5">
          {timeFrame && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">{timeFrame}</span>}
          {difficulty && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">{difficulty}</span>}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage({ rid }: { rid: string | null }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!rid) {
        setLoading(false);
        setError("No result ID was provided. Add ?rid=YOUR_ID to the URL to view a report.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/results/${rid}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as ApiError | null;
          throw new Error(body?.error ?? (res.status === 404 ? "Result not found." : "Something went wrong."));
        }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [rid]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your result link:", url);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} />;
  if (!data) return <ErrorView message="No data available." />;

  const f = data.fields;
  const get = (key: string) => asString(f[key]);

  const primary = get("primary_pattern");
  const secondary = get("secondary_pattern");
  const showSecondary = secondary && secondary.toUpperCase() !== "NONE" && secondary.trim() !== "";
  const need = get("need") || get("main_need");
  const needFormatted = formatNeed(need);

  const aiSummary = get("ai_summary");
  const aiMechanism = get("ai_mechanism");
  const aiWhyItMatters = get("ai_why_it_matters");
  const aiMainNeedExplanation = get("ai_main_need_explanation");
  const aiResourceInterpretation = get("ai_resource_interpretation");
  const aiFirstStep = get("ai_first_step");
  const aiReflection = get("ai_reflection");
  const aiConfidence = get("ai_confidence");
  const aiWeakestResource = get("ai_weakest_resource");
  const aiInterventionSummary = get("ai_intervention_summary");

  const roleContext = get("role_context");
  const pressureSourcesRaw = get("pressure_sources");
  const pressureSources = isSafePressureSource(pressureSourcesRaw) ? pressureSourcesRaw : "";
  const improvementGoal = get("improvement_goal");
  const rechargeScore = get("recharge_score");
  const rechargeLevelText = get("recharge_level_text");
  const ageGroup = get("age_group");

  const aiRec1Title = get("ai_rec_1_title");
  const aiRec1Target = get("ai_rec_1_target");
  const aiRec1Why = get("ai_rec_1_why");
  const aiRec1How = get("ai_rec_1_how");
  const aiRec1TimeFrame = get("ai_rec_1_time_frame");
  const aiRec1Difficulty = get("ai_rec_1_difficulty");

  const aiRec2Title = get("ai_rec_2_title");
  const aiRec2Target = get("ai_rec_2_target");
  const aiRec2Why = get("ai_rec_2_why");
  const aiRec2How = get("ai_rec_2_how");
  const aiRec2TimeFrame = get("ai_rec_2_time_frame");
  const aiRec2Difficulty = get("ai_rec_2_difficulty");

  const aiRec3Title = get("ai_rec_3_title");
  const aiRec3Target = get("ai_rec_3_target");
  const aiRec3Why = get("ai_rec_3_why");
  const aiRec3How = get("ai_rec_3_how");
  const aiRec3TimeFrame = get("ai_rec_3_time_frame");
  const aiRec3Difficulty = get("ai_rec_3_difficulty");

  const summaryText = firstNonEmpty(aiSummary, get("driver_1"));
  const keyInsightText = firstNonEmpty(aiWhyItMatters, aiMechanism, defaultKeyInsight(primary));

  const gaps = buildNeedGapItems(get);
  const resources = buildResourceItems(get);
  const hasGapData = gaps.some((g) => g.value > 0) || resources.some((r) => r.value > 0);

  const loopSteps = getStressLoop(primary);

  const rechargeDisplay = rechargeScore
    ? `${rechargeScore}/5${rechargeLevelText ? ` · ${rechargeLevelText}` : ""}`
    : rechargeLevelText || "";

  const hasContext = roleContext || pressureSources || improvementGoal || rechargeDisplay;

  const hasAiRecs = !!(aiRec1Title || aiRec2Title || aiRec3Title);
  const hasFallbackRecs = !!(get("action_1") || get("action_2") || get("action_3"));

  const safeReflection = (() => {
    if (aiReflection && aiReflection.trim()) return aiReflection;
    if (get("reflection") && get("reflection").trim()) return get("reflection");
    return "Where are you giving more than you are receiving back — and what would make this feel more mutual, recognized, or sustainable?";
  })();

  const needExplanationShort = truncateToTwoSentences(aiMainNeedExplanation);
  const resourceInterpretationShort = truncateToTwoSentences(aiResourceInterpretation);

  const firstResilienceLever = firstNonEmpty(
    truncateToTwoSentences(aiInterventionSummary),
    truncateToTwoSentences(aiResourceInterpretation)
  );

  const showSignalsSection =
    get("cog_attention") || get("cog_decision") || get("cog_regulation") ||
    get("body") || get("emotions") || get("behavior");

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-900 font-sans py-10 px-4 sm:py-12">
      <div className="max-w-[860px] mx-auto">

        <div className="print-only print-header">
          Stress Assessment Result · {formatReportDate(get("created_at"))}
        </div>

        {/* ── Hero ── */}
        <section className="bg-white ring-1 ring-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Stress &amp; Resilience Assessment
            </div>
            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center rounded-full bg-white ring-1 ring-slate-300 text-slate-700 text-xs font-medium px-3.5 py-1.5 hover:bg-slate-50 transition-colors"
              >
                {copied ? "Link copied" : "Share"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center rounded-full bg-slate-900 text-white text-xs font-medium px-3.5 py-1.5 hover:bg-slate-700 transition-colors"
              >
                Save as PDF
              </button>
            </div>
          </div>

          <h1 className="text-[clamp(28px,5vw,46px)] leading-[1.07] m-0 mb-2.5 text-[#0f172a] font-bold tracking-[-0.02em]">
            {formatPattern(primary)}
          </h1>

          <p className="text-[16.5px] leading-[1.5] text-[#334155] font-semibold max-w-[680px] m-0 mb-3">
            {patternAnchor(primary)}
          </p>

          {summaryText && (
            <p className="text-[15px] leading-[1.7] text-slate-600 max-w-[680px] m-0 mb-5">
              {summaryText}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Pill label="Pattern" value={formatPattern(primary)} accent />
            {showSecondary && <Pill label="Secondary" value={formatPattern(secondary)} />}
            {needFormatted && !isNoMajorNeed(needFormatted) && <Pill label="Main need" value={needFormatted} />}
            {isNoMajorNeed(needFormatted) && <Pill label="Need focus" value="Maintenance & resource protection" />}
            {aiConfidence && <Pill label="Confidence" value={aiConfidence} subtle />}
            {aiWeakestResource && <Pill label="Weakest resource" value={aiWeakestResource} subtle />}
          </div>

          {/* Inline context strip */}
          {hasContext && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-5 gap-y-2">
              {roleContext && (
                <span className="text-[13px] text-slate-500">
                  <span className="font-semibold text-slate-700">Role:</span> {roleContext}
                </span>
              )}
              {pressureSources && (
                <span className="text-[13px] text-slate-500">
                  <span className="font-semibold text-slate-700">Pressure:</span> {pressureSources}
                </span>
              )}
              {improvementGoal && (
                <span className="text-[13px] text-slate-500">
                  <span className="font-semibold text-slate-700">Goal:</span> {improvementGoal}
                </span>
              )}
              {rechargeDisplay && (
                <span className="text-[13px] text-slate-500">
                  <span className="font-semibold text-slate-700">Recharge:</span> {rechargeDisplay}
                </span>
              )}
              {ageGroup && (
                <span className="text-[12px] text-slate-400">{ageGroup}</span>
              )}
            </div>
          )}
        </section>

        {/* ── Key Insight ── */}
        {keyInsightText && (
          <div className="bg-[#0f172a] rounded-2xl p-5 sm:p-6 mb-5 ring-1 ring-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
              Key insight
            </div>
            <p className="text-[16.5px] leading-[1.7] text-white font-medium m-0">
              {keyInsightText}
            </p>
          </div>
        )}

        {/* ── Your Stress Loop ── */}
        <Section title="Your stress loop">
          <p className="text-[13px] leading-[1.55] text-slate-400 -mt-1">
            How this pattern likely drives and sustains itself.
          </p>
          <div className="flex flex-col gap-0 mt-1">
            {loopSteps.map((s, i) => (
              <div key={s.step} className="flex gap-3 items-stretch">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </div>
                  {i < loopSteps.length - 1 && (
                    <div className="w-px bg-slate-200 flex-1 my-1" />
                  )}
                </div>
                <div className={`pb-${i < loopSteps.length - 1 ? "3" : "0"} pt-1`}>
                  <div className="text-[14.5px] leading-[1.55] text-slate-700 font-medium">{s.text}</div>
                </div>
              </div>
            ))}
            {/* Loop-back arrow label */}
            <div className="mt-3 ml-9 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">↩ loop continues</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>
        </Section>

        {/* ── Stress & Resilience Map ── */}
        {hasGapData && (
          <Section title="Stress &amp; resilience map">
            {/* Resilience focus summary */}
            <div className="bg-slate-50 ring-1 ring-slate-100 rounded-xl p-4 grid gap-2">
              {needFormatted && !isNoMajorNeed(needFormatted) && (
                <div className="flex gap-3 items-start">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 pt-0.5 w-36 flex-shrink-0">Main imbalance</span>
                  <span className="text-[13.5px] text-slate-700 font-medium">{needFormatted}</span>
                </div>
              )}
              {isNoMajorNeed(needFormatted) && (
                <div className="flex gap-3 items-start">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 pt-0.5 w-36 flex-shrink-0">Focus</span>
                  <span className="text-[13.5px] text-slate-700 font-medium">Maintenance &amp; resource protection</span>
                </div>
              )}
              {aiWeakestResource && (
                <div className="flex gap-3 items-start">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 pt-0.5 w-36 flex-shrink-0">Most vulnerable</span>
                  <span className="text-[13.5px] text-slate-700 font-medium">{aiWeakestResource}</span>
                </div>
              )}
              {firstResilienceLever && (
                <div className="flex gap-3 items-start">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-400 pt-0.5 w-36 flex-shrink-0">First lever</span>
                  <span className="text-[13.5px] text-slate-600">{firstResilienceLever}</span>
                </div>
              )}
            </div>

            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              <InsightChartCard
                title="Need gaps"
                subtitle="Higher = more strongly unmet"
                items={gaps}
                type="gap"
              />
              <InsightChartCard
                title="Resources"
                subtitle="Lower = less available right now"
                items={resources}
                type="resource"
              />
            </div>

            {needExplanationShort && (
              <p className="text-[13.5px] leading-[1.65] text-slate-600 m-0">{needExplanationShort}</p>
            )}
            {resourceInterpretationShort && needExplanationShort !== resourceInterpretationShort && (
              <p className="text-[13.5px] leading-[1.65] text-slate-600 m-0">{resourceInterpretationShort}</p>
            )}

            <div className="flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 ring-1 ring-amber-100 rounded-lg px-3.5 py-2.5">
              <span className="font-semibold flex-shrink-0">Note:</span>
              <span>Low need gaps do not mean no stress. Stress can also come from pressure, appraisal, recovery, or reduced resources.</span>
            </div>
            <HowToReadToggle />
          </Section>
        )}

        {/* ── How This May Show Up ── */}
        {showSignalsSection && (
          <Section title="How this may show up">
            <div className="grid gap-2.5 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
              <CompactCard title="Attention &amp; Focus" text={get("cog_attention")} />
              <CompactCard title="Thinking &amp; Decisions" text={get("cog_decision")} />
              <CompactCard title="Self-Regulation" text={get("cog_regulation")} />
              <CompactCard title="Body" text={get("body")} />
              <CompactCard title="Emotions" text={get("emotions")} />
              <CompactCard title="Behavior" text={get("behavior")} />
            </div>
          </Section>
        )}

        {/* ── 7-Day Resilience Plan ── */}
        {(hasAiRecs || hasFallbackRecs) && (
          <Section title="Your 7-day resilience plan">
            <div className="bg-[#fef3c7] ring-1 ring-[#fde68a] rounded-xl p-4 -mt-1">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#92400e] mb-1">Start here</div>
              <div className="text-[14.5px] leading-[1.6] text-[#92400e] font-medium">
                {firstNonEmpty(aiFirstStep, startHereText(primary))}
              </div>
            </div>
            {hasAiRecs ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <RecommendationCard num={1} title={aiRec1Title} target={aiRec1Target} why={aiRec1Why} how={aiRec1How} timeFrame={aiRec1TimeFrame} difficulty={aiRec1Difficulty} />
                <RecommendationCard num={2} title={aiRec2Title} target={aiRec2Target} why={aiRec2Why} how={aiRec2How} timeFrame={aiRec2TimeFrame} difficulty={aiRec2Difficulty} />
                <RecommendationCard num={3} title={aiRec3Title} target={aiRec3Target} why={aiRec3Why} how={aiRec3How} timeFrame={aiRec3TimeFrame} difficulty={aiRec3Difficulty} />
              </div>
            ) : (
              <div className="grid gap-2.5">
                {[get("action_1"), get("action_2"), get("action_3")].filter(Boolean).map((a, i) => (
                  <div key={i} className="flex gap-3 bg-slate-50 ring-1 ring-slate-100 rounded-xl p-3.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <div className="text-[14px] leading-[1.6] text-slate-700">{a}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── Reflection ── */}
        <Section title="Reflection">
          <Quote>{safeReflection}</Quote>
        </Section>

        {/* ── About This Report ── */}
        <div className="text-center px-4 pb-2 mb-2">
          <p className="text-[12.5px] leading-[1.6] text-slate-400 max-w-[600px] mx-auto">
            This is a non-clinical stress and resilience interpretation, not a diagnosis.
            If stress feels unmanageable or strongly affects daily life, consider speaking with a qualified professional or trusted support resource.
          </p>
          {get("result_id") && (
            <p className="text-[11px] text-slate-300 mt-1">Result {get("result_id")}</p>
          )}
          <p className="text-[11px] text-slate-300 mt-0.5">{formatReportDate(get("created_at"))}</p>
        </div>

        <div className="print-only print-disclaimer">
          <div className="print-disclaimer-title">About this report</div>
          <p>This is a non-clinical stress and resilience interpretation, not a diagnosis. It is intended for personal reflection only and is not a substitute for professional evaluation.</p>
        </div>

      </div>
    </div>
  );
}

function Pill({ label, value, accent, subtle }: { label: string; value: string; accent?: boolean; subtle?: boolean }) {
  if (!value || !value.trim()) return null;
  return (
    <div className={`inline-flex flex-col rounded-xl px-3.5 py-2 ${accent ? "bg-[#e0f2fe] ring-1 ring-[#bae6fd]" : subtle ? "bg-slate-50 ring-1 ring-slate-200" : "bg-slate-100 ring-1 ring-slate-200"}`}>
      <span className={`text-[9.5px] font-bold uppercase tracking-[0.1em] mb-0.5 ${accent ? "text-[#0369a1]" : "text-slate-400"}`}>{label}</span>
      <span className={`text-[13px] font-semibold ${accent ? "text-[#0369a1]" : subtle ? "text-slate-500" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}
