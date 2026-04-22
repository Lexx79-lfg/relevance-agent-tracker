export type QuoteTrigger =
  | "task_complete"
  | "important_task_complete"
  | "milestone_ready"
  | "reset_mode"
  | "no_tasks_state";

type QuoteEntry = {
  text: string;
};

const QUOTE_COOLDOWN_MS = 12_000;
const lastShownAtByTrigger = new Map<QuoteTrigger, number>();

const QUOTES: Record<QuoteTrigger, QuoteEntry[]> = {
  task_complete: [
    { text: "One useful action is enough to change the direction of a day." },
    { text: "Momentum starts quietly." },
    { text: "The step counts because you took it." },
  ],
  important_task_complete: [
    { text: "You moved something that mattered." },
    { text: "Real progress often looks like one grounded choice." },
    { text: "That was not everything. It was enough to move forward." },
  ],
  milestone_ready: [
    { text: "The next threshold is close because you kept showing up." },
    { text: "Readiness is built before it is visible." },
  ],
  reset_mode: [
    { text: "A reset is not a retreat. It is how you return with steadier hands." },
    { text: "Slow down enough to choose well." },
  ],
  no_tasks_state: [
    { text: "Start with one thing that would make the next hour lighter." },
    { text: "Clarity usually begins with a single honest task." },
  ],
};

export function getProgressQuote(trigger: QuoteTrigger, options: { force?: boolean; rare?: boolean } = {}) {
  const now = Date.now();
  const lastShownAt = lastShownAtByTrigger.get(trigger) ?? 0;

  if (!options.force && now - lastShownAt < QUOTE_COOLDOWN_MS) {
    return null;
  }

  if (options.rare && Math.random() > 0.28) {
    return null;
  }

  const optionsForTrigger = QUOTES[trigger];
  const quote = optionsForTrigger[Math.floor(Math.random() * optionsForTrigger.length)];
  lastShownAtByTrigger.set(trigger, now);

  return quote.text;
}
