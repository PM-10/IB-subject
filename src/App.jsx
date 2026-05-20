import { useMemo, useState } from "react";

const STEPS = [
  {
    key: "interests",
    title: "What draws your curiosity?",
    subtitle: "Pick all that resonate.",
    multi: true,
    options: ["STEM", "Humanities", "Business / Econ", "Arts", "Languages"],
  },
  {
    key: "strengths",
    title: "Where do you naturally excel?",
    subtitle: "Pick all that apply.",
    multi: true,
    options: [
      "Quantitative reasoning",
      "Essay writing",
      "Memorization",
      "Creative design",
    ],
  },
  {
    key: "plan",
    title: "What's next after the IB?",
    subtitle: "Choose one direction.",
    multi: false,
    options: [
      "Medicine",
      "Engineering / CS",
      "Law / Humanities",
      "Business / Econ",
      "Liberal Arts",
      "Undecided",
    ],
  },
  {
    key: "tier",
    title: "University target tier",
    subtitle: "We'll calibrate rigor accordingly.",
    multi: false,
    options: [
      "Ultra-competitive (Oxbridge / Ivy)",
      "Competitive",
      "Standard",
    ],
  },
];

const PLAN_RULES = {
  "Engineering / CS": {
    HL: ["Mathematics AA", "Physics", "Computer Science"],
    SL: ["English A: Lang & Lit", "Economics", "Spanish B"],
    why: "Engineering and CS programmes universally require Maths AA HL and Physics HL. Computer Science HL signals fluency in algorithmic thinking — decisive for top-tier admissions.",
  },
  Medicine: {
    HL: ["Chemistry", "Biology", "Mathematics AA"],
    SL: ["English A: Lang & Lit", "Psychology", "Spanish B"],
    why: "Med schools demand Chemistry HL and Biology HL without exception. Maths AA HL strengthens biostatistics readiness and unlocks dual-degree paths.",
  },
  "Business / Econ": {
    HL: ["Mathematics AA", "Economics", "English A: Lang & Lit"],
    SL: ["History", "Spanish B", "Visual Arts"],
    why: "LSE, Wharton and Oxford PPE expect Maths AA HL plus Economics HL. English A HL underpins the analytical writing demanded in interviews and PS.",
  },
  "Law / Humanities": {
    HL: ["English A: Literature", "History", "Global Politics"],
    SL: ["Mathematics AI", "Biology", "Spanish B"],
    why: "Law and humanities admissions weight English A HL and History HL most heavily. Global Politics HL adds a contemporary, evaluative lens valued by Oxford and Yale.",
  },
  "Liberal Arts": {
    HL: ["English A: Literature", "History", "Visual Arts"],
    SL: ["Mathematics AI", "Biology", "Spanish B"],
    why: "US liberal arts colleges reward intellectual breadth. This mix preserves quantitative literacy while showcasing depth in writing, history and creative practice.",
  },
  Undecided: {
    HL: ["Mathematics AA", "English A: Lang & Lit", "Economics"],
    SL: ["Biology", "History", "Spanish B"],
    why: "A balanced, doors-open profile. Maths AA HL preserves STEM and Econ tracks; English A HL keeps humanities open; Economics HL is broadly respected.",
  },
};

function resolve(answers) {
  const { plan, tier, interests = [], strengths = [] } = answers;
  const base = PLAN_RULES[plan] ?? PLAN_RULES.Undecided;
  let HL = [...base.HL];
  let SL = [...base.SL];
  let why = base.why;

  if (plan === "Business / Econ" && tier !== "Ultra-competitive (Oxbridge / Ivy)") {
    HL = HL.map((s) => (s === "Mathematics AA" ? "Mathematics AI" : s));
    why += " Maths AI HL is used here — accepted by most competitive Econ programmes outside Oxbridge/Ivy.";
  }

  if (plan === "Undecided") {
    if (interests.includes("Arts") || strengths.includes("Creative design")) {
      SL = SL.map((s) => (s === "Biology" ? "Visual Arts" : s));
    }
    if (interests.includes("STEM") && !strengths.includes("Essay writing")) {
      HL = HL.map((s) => (s === "Economics" ? "Physics" : s));
    }
  }

  if (tier === "Ultra-competitive (Oxbridge / Ivy)") {
    why += " Ultra-competitive tier: HL choices prioritise the highest-signal subjects for elite admissions committees.";
  }

  return { HL, SL, why };
}

const GROUPS = ["Group 1 · Language A", "Group 2 · Language B", "Group 3 · Societies", "Group 4 · Sciences", "Group 5 · Maths", "Group 6 · Arts / Elective"];

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ interests: [], strengths: [] });
  const [done, setDone] = useState(false);

  const total = STEPS.length;
  const progress = done ? 100 : (step / total) * 100;
  const current = STEPS[step];

  const selected = answers[current?.key];
  const canAdvance = current?.multi ? selected?.length > 0 : Boolean(selected);

  const toggle = (opt) => {
    setAnswers((a) => {
      if (current.multi) {
        const set = new Set(a[current.key] ?? []);
        set.has(opt) ? set.delete(opt) : set.add(opt);
        return { ...a, [current.key]: [...set] };
      }
      return { ...a, [current.key]: opt };
    });
  };

  const next = () => (step + 1 < total ? setStep(step + 1) : setDone(true));
  const back = () => (done ? setDone(false) : setStep(Math.max(0, step - 1)));
  const reset = () => {
    setAnswers({ interests: [], strengths: [] });
    setStep(0);
    setDone(false);
  };

  const result = useMemo(() => (done ? resolve(answers) : null), [done, answers]);

  const isPicked = (opt) =>
    current?.multi ? (selected ?? []).includes(opt) : selected === opt;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-zinc-200/60 z-50">
        <div
          className="h-full bg-zinc-900 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-8 pt-20 pb-16">
        <header className="mb-12 sm:mb-16">
          <div className="text-xs tracking-[0.2em] uppercase text-zinc-400 mb-3">
            IB Advisor
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Find your ideal subject combination.
          </h1>
          <p className="mt-3 text-zinc-500 text-base sm:text-lg leading-relaxed">
            A four-step pathway to a balanced, university-ready IB Diploma.
          </p>
        </header>

        {!done ? (
          <section>
            <div className="flex items-center justify-between mb-8 text-xs text-zinc-400">
              <span>
                Step {step + 1} of {total}
              </span>
              <span>{current.multi ? "Select one or more" : "Select one"}</span>
            </div>

            <h2 className="text-2xl sm:text-[28px] font-semibold tracking-tight mb-2">
              {current.title}
            </h2>
            <p className="text-zinc-500 mb-8">{current.subtitle}</p>

            <div className="grid gap-2.5">
              {current.options.map((opt) => {
                const active = isPicked(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={`group flex items-center justify-between text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                        : "border-zinc-200 bg-white hover:border-zinc-400 hover:-translate-y-[1px]"
                    }`}
                  >
                    <span className="text-[15px] font-medium">{opt}</span>
                    <span
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                        active
                          ? "border-white bg-white"
                          : "border-zinc-300 group-hover:border-zinc-500"
                      }`}
                    >
                      {active && (
                        <svg viewBox="0 0 16 16" className="h-3 w-3 text-zinc-900" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8.5l3.5 3.5L13 5" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-10">
              <button
                onClick={back}
                disabled={step === 0}
                className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                ← Back
              </button>
              <button
                onClick={next}
                disabled={!canAdvance}
                className="px-6 py-3 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {step + 1 === total ? "See my path" : "Continue"}
              </button>
            </div>
          </section>
        ) : (
          <section>
            <div className="text-xs tracking-[0.2em] uppercase text-zinc-400 mb-3">
              Your Ideal IB Path
            </div>
            <h2 className="text-2xl sm:text-[28px] font-semibold tracking-tight mb-8">
              A combination shaped around {answers.plan?.toLowerCase()}.
            </h2>

            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
                {[
                  { label: "Higher Level", tag: "HL", items: result.HL },
                  { label: "Standard Level", tag: "SL", items: result.SL },
                ].map(({ label, tag, items }) => (
                  <div key={tag} className="p-6 sm:p-8">
                    <div className="flex items-baseline justify-between mb-5">
                      <h3 className="text-sm font-semibold tracking-wide text-zinc-900">
                        {label}
                      </h3>
                      <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">
                        {tag} · 3 subjects
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {items.map((s, i) => (
                        <li key={s} className="flex items-start gap-3">
                          <span className="mt-[2px] text-[11px] text-zinc-400 tabular-nums">
                            0{i + 1}
                          </span>
                          <span className="text-[15px] text-zinc-900">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z" />
                </svg>
                <h3 className="text-sm font-semibold tracking-wide">
                  University Validation
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-zinc-600">
                {result.why}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400">
              {GROUPS.map((g) => (
                <div key={g} className="px-3 py-2 rounded-lg border border-zinc-200 bg-white/60">
                  {g}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-10">
              <button
                onClick={back}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-all duration-200"
              >
                ← Adjust answers
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-all duration-200"
              >
                Start over
              </button>
            </div>
          </section>
        )}

        <footer className="mt-20 text-[11px] text-zinc-400">
          Guidance only — confirm subject prerequisites with your target universities.
        </footer>
      </div>
    </div>
  );
}
