import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useJourney } from "../context/JourneyContext";
import { loadAppState, saveAppState } from "../lib/appState";
import { playCommandSound } from "../lib/commandSound";
import { generateMentorResponse, getModeQuote, MODE_META, MODE_PROMPTS } from "../lib/mentor";
import type { AppState, LogEntry, MentorMode } from "../types/app";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTimeAwareGreeting(name: string) {
  const hour = new Date().getHours();

  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 17) return `Good afternoon, ${name}.`;
  if (hour < 22) return `Good evening, ${name}.`;

  return `Welcome back, ${name}.`;
}

type MentorHomeRoute = "tasks" | "calendar" | "support" | "journey" | "settings";
type IntentOption = "calm" | "recover" | "task" | "plan" | "prepare" | "custom";
type RecoveryReason = "distracted" | "overwhelmed" | "avoiding" | "late";
type SupportLevel = "reset" | "decide" | "talk";

const INTENT_OPTIONS: Array<{ id: IntentOption; label: string; helper: string }> = [
  { id: "calm", label: "Calm down", helper: "Settle your body first." },
  { id: "recover", label: "Get back on track", helper: "Recover from drift without shame." },
  { id: "task", label: "Do my next task", helper: "Go to priorities." },
  { id: "plan", label: "Plan today", helper: "Make the day clearer." },
  { id: "prepare", label: "Prepare for something important", helper: "Get ready for a moment that matters." },
];

const RECOVERY_REASONS: Array<{ id: RecoveryReason; label: string }> = [
  { id: "distracted", label: "Distracted" },
  { id: "overwhelmed", label: "Overwhelmed" },
  { id: "avoiding", label: "Avoiding" },
  { id: "late", label: "Running late" },
];

const RECOVERY_STEPS: Record<RecoveryReason, string> = {
  distracted: "Close everything except what matters. Start for 5 minutes.",
  overwhelmed: "Pick ONE thing that matters. Ignore the rest.",
  avoiding: "Do the smallest possible version. Just begin.",
  late: "Drop non-essential tasks. Focus only on what must happen next.",
};

const SUPPORT_LEVELS: Array<{ id: SupportLevel; label: string; helper: string }> = [
  { id: "reset", label: "I need to reset", helper: "Calm your body first." },
  { id: "decide", label: "I need help deciding", helper: "Find the next useful choice." },
  { id: "talk", label: "I need to talk to someone", helper: "Reach for a steady person." },
];

const SUPPORT_GUIDANCE: Record<
  SupportLevel,
  { title: string; step: string; phrase: string }
> = {
  reset: {
    title: "Take one steady reset.",
    step: "Breathe in slowly. Breathe out longer. Feel your feet and drop your shoulders.",
    phrase: "I can slow this down.",
  },
  decide: {
    title: "Make the next choice smaller.",
    step: "Name the two real options. Choose the one that reduces the most pressure today.",
    phrase: "I only need the next useful choice.",
  },
  talk: {
    title: "Bring in a trusted voice.",
    step: "Text or call one steady person: “Can I talk for 10 minutes? I do not need fixing; I need a calm voice.”",
    phrase: "I do not have to carry this alone.",
  },
};

const COMPLETION_QUOTES = [
  "Small steps still count.",
  "You moved the mission forward.",
  "Progress is built one honest action at a time.",
  "A little momentum is still momentum.",
  "You kept faith with the next step.",
  "One completed step changes the day.",
  "Steady effort becomes real distance.",
];

function getRandomCompletionQuote() {
  return COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)];
}

function getIntentStep(intent: IntentOption | null, recoveryReason: RecoveryReason | null, responseStep: string | null) {
  if (intent === "calm") return "Take 3 slow breaths. Drop your shoulders.";
  if (intent === "recover" && recoveryReason) return RECOVERY_STEPS[recoveryReason];
  if (intent === "prepare") return "Write down the one thing you want from this.";
  if (intent === "custom" && responseStep) return responseStep;

  return null;
}

function getIntentLabel(intent: IntentOption | null) {
  if (intent === "calm") return "Calm down";
  if (intent === "recover") return "Get back on track";
  if (intent === "prepare") return "Prepare for something important";
  if (intent === "custom") return "Custom guidance";

  return "Guidance";
}

export function MentorHomePage({ onNavigate }: { onNavigate: (page: MentorHomeRoute) => void }) {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [completionPulseKey, setCompletionPulseKey] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");
  const [completionQuote, setCompletionQuote] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<IntentOption | null>(null);
  const [recoveryReason, setRecoveryReason] = useState<RecoveryReason | null>(null);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [selectedSupportLevel, setSelectedSupportLevel] = useState<SupportLevel | null>(null);
  const { completeMilestoneProgress, currentUser, markActivity } = useJourney();
  const { mission, mode, userText, response, tokens, milestone, completedSteps, log } = appState;

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    if (!completionMessage) return;

    const timeoutId = window.setTimeout(() => {
      setCompletionMessage("");
      setCompletionQuote("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [completionMessage, completionPulseKey]);

  const progressPercent = useMemo(() => Math.min((tokens / milestone) * 100, 100), [tokens, milestone]);
  const recommendedStep = getIntentStep(selectedIntent, recoveryReason, response?.nextStep ?? null);
  const userName = currentUser?.name ?? "friend";
  const supportReflection = selectedIntent
    ? "Stay with this one step. After it is done, we will choose the next honest move."
    : "Choose the closest fit. You do not have to explain everything before you begin.";

  function updateAppState(update: Partial<AppState>) {
    setAppState((current) => ({ ...current, ...update }));
  }

  function handleModeChange(nextMode: MentorMode) {
    updateAppState({
      mode: nextMode,
      response: null,
      quote: getModeQuote(nextMode),
    });
  }

  function handleGenerateGuidance() {
    const nextResponse = generateMentorResponse(mode, mission, userText);

    markActivity();
    setSelectedIntent("custom");
    setRecoveryReason(null);
    updateAppState({
      response: nextResponse,
      quote: getModeQuote(mode),
    });
  }

  function handleIntentSelect(intent: IntentOption) {
    playCommandSound("confirm");
    markActivity();
    setCompletionMessage("");
    setCompletionQuote("");

    if (intent === "task") {
      onNavigate("tasks");
      return;
    }

    if (intent === "plan") {
      onNavigate("calendar");
      return;
    }

    setSelectedIntent(intent);
    setRecoveryReason(null);
    updateAppState({ response: null });
  }

  function handleCompleteStep() {
    if (!recommendedStep) return;

    playCommandSound("confirm");
    setCompletionPulseKey((current) => current + 1);
    setCompletionMessage("Progress confirmed. Choose what you need next.");
    setCompletionQuote(getRandomCompletionQuote());

    const entry: LogEntry = {
      id: Date.now(),
      time: formatTime(new Date()),
      mode,
      mission: mission.trim() || "Unnamed mission",
      note: recommendedStep,
    };
    const nextTokens = tokens + 1;

    completeMilestoneProgress();
    updateAppState({
      response: null,
      tokens: nextTokens,
      completedSteps: completedSteps + 1,
      log: [entry, ...log].slice(0, 8),
      quote:
        nextTokens >= milestone
          ? "Launch window reached. Let the win register before you move again."
          : "Signal received. One grounded step is enough to change the readout.",
    });
    setSelectedIntent(null);
    setRecoveryReason(null);
  }

  return (
    <section className="mentor-panel command-panel command-screen" style={homePanelStyle}>
      <div style={companionRowStyle}>
        <div>
          <h2 style={titleStyle}>{getTimeAwareGreeting(userName)}</h2>
          <div className="command-kicker" style={kickerStyle}>A steady place to begin</div>
        </div>
        <button
          className="mentor-soft-button"
          onClick={() => {
            playCommandSound("confirm");
            setGuidanceOpen(true);
          }}
          style={companionSupportButtonStyle}
          type="button"
        >
          Need support?
        </button>
      </div>

      <p style={groundingStyle}>
        Let’s start with what you need, then choose one useful next move.
      </p>

      {!selectedIntent ? (
        <div className="command-card" style={intentCardStyle}>
          <div style={labelStyle}>Start with you</div>
          <h3 style={intentQuestionStyle}>What do you need right now?</h3>
          <p style={intentIntroStyle}>Pick the closest answer. I’ll keep the next step simple.</p>
          <div style={intentGridStyle}>
            {INTENT_OPTIONS.map((option) => (
              <button
                className="mentor-soft-button"
                key={option.id}
                onClick={() => handleIntentSelect(option.id)}
                style={intentButtonStyle}
                type="button"
              >
                <span style={intentButtonLabelStyle}>{option.label}</span>
                <span style={intentButtonHelperStyle}>{option.helper}</span>
              </button>
            ))}
          </div>
          <div aria-live="polite" style={{ ...successMessageStyle, opacity: completionMessage ? 1 : 0 }}>
            {completionMessage || "Progress confirmed."}
          </div>
          <p style={{ ...completionQuoteStyle, opacity: completionQuote ? 1 : 0 }}>
            {completionQuote || "Small steps still count."}
          </p>
        </div>
      ) : (
        <div
          className="command-card"
          key={`next-action-${completionPulseKey}-${selectedIntent ?? "intent"}`}
          style={{
            ...nextActionCardStyle,
            ...(completionMessage ? nextActionCardCompleteStyle : {}),
          }}
        >
          <div style={stepHeaderRowStyle}>
            <div>
              <div style={labelStyle}>Your next step</div>
              <p style={selectedIntentLabelStyle}>{getIntentLabel(selectedIntent)}</p>
            </div>
            <button
              className="mentor-soft-button"
              onClick={() => {
                setSelectedIntent(null);
                setRecoveryReason(null);
                updateAppState({ response: null });
              }}
              style={changeNeedButtonStyle}
              type="button"
            >
              Change need
            </button>
          </div>

          {selectedIntent === "recover" && !recoveryReason ? (
            <>
              <p style={nextStepStyle}>Let’s reset. What pulled you off?</p>
              <div style={recoveryGridStyle}>
                {RECOVERY_REASONS.map((reason) => (
                  <button
                    className="mentor-soft-button"
                    key={reason.id}
                    onClick={() => {
                      playCommandSound("confirm");
                      setRecoveryReason(reason.id);
                    }}
                    style={recoveryButtonStyle}
                    type="button"
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={nextStepStyle}>{recommendedStep}</p>
              <button
                className="mentor-primary-button"
                onClick={handleCompleteStep}
                style={{
                  ...completeButtonStyle,
                  ...(completionMessage ? completeButtonSuccessStyle : {}),
                }}
              >
                <span aria-hidden="true">✓</span>
                <span>{completionMessage ? "Step secured" : "I completed this step"}</span>
              </button>
            </>
          )}

          <div
            aria-live="polite"
            style={{
              ...successMessageStyle,
              opacity: completionMessage ? 1 : 0,
            }}
          >
            {completionMessage || "Progress confirmed."}
          </div>
          <p style={{ ...completionQuoteStyle, opacity: completionQuote ? 1 : 0 }}>
            {completionQuote || "Small steps still count."}
          </p>
        </div>
      )}

      <div
        key={`support-${completionPulseKey}`}
        style={{
          ...quietSupportStyle,
          ...(completionPulseKey > 0 ? quietSupportPulseStyle : {}),
        }}
      >
        {!completionQuote && <p style={reflectionStyle}>{supportReflection}</p>}

        <div style={missionReadoutStyle}>
          <div>
            <div style={quietLabelStyle}>Current focus</div>
            <div style={missionNameStyle}>{mission || "No mission named yet"}</div>
          </div>
          <div style={compactProgressStyle}>
            <div style={fuelTrackStyle}>
              <div style={{ ...fuelFillStyle, width: `${progressPercent}%` }} />
            </div>
            <div style={statusMetaStyle}>
              {tokens} / {milestone} steps · {completedSteps} completed
            </div>
          </div>
        </div>
      </div>

      <details
        open={guidanceOpen}
        onToggle={(event) => setGuidanceOpen(event.currentTarget.open)}
        style={detailsStyle}
      >
        <summary style={summaryStyle}>Support options</summary>

        <div style={supportFlowStyle}>
          <div>
            <div style={fieldLabelOnlyStyle}>Right level of support</div>
            <h3 style={supportQuestionStyle}>What kind of support do you need right now?</h3>
          </div>

          <div style={supportLevelGridStyle}>
            {SUPPORT_LEVELS.map((level) => {
              const active = selectedSupportLevel === level.id;

              return (
                <button
                  className="mentor-soft-button"
                  key={level.id}
                  onClick={() => {
                    playCommandSound("confirm");
                    markActivity();
                    setSelectedSupportLevel(level.id);
                  }}
                  style={{
                    ...supportLevelButtonStyle,
                    ...(active ? supportLevelButtonActiveStyle : {}),
                  }}
                  type="button"
                >
                  <span style={intentButtonLabelStyle}>{level.label}</span>
                  <span style={intentButtonHelperStyle}>{level.helper}</span>
                </button>
              );
            })}
          </div>

          {selectedSupportLevel && (
            <div aria-live="polite" style={supportGuidanceCardStyle}>
              <div style={labelStyle}>Support step</div>
              <h4 style={supportTitleStyle}>{SUPPORT_GUIDANCE[selectedSupportLevel].title}</h4>
              <p style={supportStepStyle}>{SUPPORT_GUIDANCE[selectedSupportLevel].step}</p>
              <p style={supportPhraseStyle}>Try saying: “{SUPPORT_GUIDANCE[selectedSupportLevel].phrase}”</p>
              <button
                className="mentor-soft-button"
                onClick={() => setSelectedSupportLevel(null)}
                style={changeSupportButtonStyle}
                type="button"
              >
                Choose a different support level
              </button>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

const homePanelStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "24px",
  boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
  display: "grid",
  gap: "clamp(14px, 3vw, 20px)",
  padding: "clamp(16px, 4vw, 30px)",
} satisfies CSSProperties;

const companionRowStyle = {
  alignItems: "flex-start",
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
  justifyContent: "space-between",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.78rem",
  fontWeight: 900,
  letterSpacing: "0.16em",
  marginTop: "12px",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.75rem, 7vw, 3.2rem)",
  letterSpacing: "-0.05em",
  lineHeight: 0.98,
  margin: 0,
} satisfies CSSProperties;

const companionSupportButtonStyle = {
  background: "rgba(15, 23, 42, 0.62)",
  border: "1px solid rgba(134, 239, 172, 0.24)",
  borderRadius: "999px",
  color: "#bbf7d0",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 900,
  letterSpacing: "0.08em",
  padding: "9px 12px",
} satisfies CSSProperties;

const groundingStyle = {
  color: "#dbeafe",
  fontSize: "clamp(1.08rem, 3vw, 1.45rem)",
  lineHeight: 1.4,
  margin: 0,
  maxWidth: "720px",
} satisfies CSSProperties;

const reflectionStyle = {
  color: "#94a3b8",
  fontSize: "0.98rem",
  lineHeight: 1.5,
  margin: 0,
} satisfies CSSProperties;

const nextActionCardStyle = {
  animation: "none",
  background:
    "radial-gradient(circle at 88% 18%, rgba(134, 239, 172, 0.16), transparent 28%), linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(2, 6, 23, 0.72))",
  border: "1px solid rgba(134, 239, 172, 0.34)",
  borderRadius: "26px",
  boxShadow: "0 24px 64px rgba(0,0,0,0.28), inset 0 0 42px rgba(134, 239, 172, 0.07)",
  display: "grid",
  gap: "clamp(10px, 2.4vw, 16px)",
  padding: "clamp(16px, 4vw, 28px)",
} satisfies CSSProperties;

const intentCardStyle = {
  ...nextActionCardStyle,
  background:
    "radial-gradient(circle at 88% 18%, rgba(125, 211, 252, 0.13), transparent 28%), linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(2, 6, 23, 0.72))",
} satisfies CSSProperties;

const intentQuestionStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.8rem, 5vw, 3rem)",
  letterSpacing: "-0.04em",
  lineHeight: 1.05,
  margin: 0,
} satisfies CSSProperties;

const intentIntroStyle = {
  color: "#cbd5e1",
  fontSize: "0.95rem",
  lineHeight: 1.4,
  margin: "-6px 0 0",
  maxWidth: "640px",
} satisfies CSSProperties;

const intentGridStyle = {
  display: "grid",
  gap: "8px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
} satisfies CSSProperties;

const intentButtonStyle = {
  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(2, 6, 23, 0.68))",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: "18px",
  color: "#f8fafc",
  cursor: "pointer",
  display: "grid",
  gap: "6px",
  minHeight: "72px",
  padding: "12px 14px",
  textAlign: "left",
} satisfies CSSProperties;

const intentButtonLabelStyle = {
  color: "#f8fafc",
  fontSize: "1.02rem",
  fontWeight: 900,
  lineHeight: 1.2,
} satisfies CSSProperties;

const intentButtonHelperStyle = {
  color: "#94a3b8",
  fontSize: "0.88rem",
  lineHeight: 1.35,
} satisfies CSSProperties;

const nextActionCardCompleteStyle = {
  animation: "mentorCompletionGlow 700ms ease-out",
  border: "1px solid rgba(134, 239, 172, 0.62)",
  boxShadow: "0 26px 70px rgba(0,0,0,0.3), 0 0 42px rgba(134, 239, 172, 0.2), inset 0 0 48px rgba(134, 239, 172, 0.1)",
} satisfies CSSProperties;

const quietSupportStyle = {
  borderTop: "1px solid rgba(148, 163, 184, 0.1)",
  display: "grid",
  gap: "9px",
  opacity: 0.82,
  paddingTop: "4px",
} satisfies CSSProperties;

const quietSupportPulseStyle = {
  animation: "mentorCompletionReadout 700ms ease-out",
} satisfies CSSProperties;

const labelStyle = {
  color: "#86efac",
  fontSize: "0.78rem",
  fontWeight: 900,
  letterSpacing: "0.18em",
} satisfies CSSProperties;

const stepHeaderRowStyle = {
  alignItems: "flex-start",
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  justifyContent: "space-between",
} satisfies CSSProperties;

const selectedIntentLabelStyle = {
  color: "#94a3b8",
  fontSize: "0.92rem",
  fontWeight: 800,
  margin: "6px 0 0",
} satisfies CSSProperties;

const changeNeedButtonStyle = {
  background: "rgba(15, 23, 42, 0.62)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: "999px",
  color: "#cbd5e1",
  cursor: "pointer",
  fontSize: "0.82rem",
  fontWeight: 900,
  padding: "8px 10px",
} satisfies CSSProperties;

const nextStepStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.45rem, 4vw, 2.25rem)",
  fontWeight: 850,
  letterSpacing: "-0.03em",
  lineHeight: 1.18,
  margin: 0,
} satisfies CSSProperties;

const recoveryGridStyle = {
  display: "grid",
  gap: "10px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))",
} satisfies CSSProperties;

const recoveryButtonStyle = {
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(134, 239, 172, 0.18)",
  borderRadius: "16px",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: "0.96rem",
  fontWeight: 900,
  padding: "13px 14px",
} satisfies CSSProperties;

const completeButtonStyle = {
  alignItems: "center",
  background: "linear-gradient(180deg, #bbf7d0, #86efac)",
  border: "none",
  borderRadius: "18px",
  boxShadow: "0 18px 42px rgba(134, 239, 172, 0.2), inset 0 1px 0 rgba(255,255,255,0.55)",
  color: "#052e16",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "1.05rem",
  gap: "8px",
  fontWeight: 900,
  justifySelf: "start",
  padding: "15px 20px",
  transition: "transform 120ms ease, box-shadow 180ms ease, background 180ms ease",
} satisfies CSSProperties;

const completeButtonSuccessStyle = {
  animation: "mentorCompletionButton 520ms ease-out",
  background: "linear-gradient(180deg, #dcfce7, #86efac)",
  boxShadow: "0 20px 46px rgba(134, 239, 172, 0.28), 0 0 0 5px rgba(134, 239, 172, 0.12), inset 0 1px 0 rgba(255,255,255,0.65)",
} satisfies CSSProperties;

const successMessageStyle = {
  color: "#bbf7d0",
  fontSize: "0.96rem",
  fontWeight: 900,
  letterSpacing: "0.08em",
  minHeight: "1.45em",
  textTransform: "uppercase",
  transition: "opacity 120ms ease",
} satisfies CSSProperties;

const completionQuoteStyle = {
  color: "#cbd5e1",
  fontSize: "0.96rem",
  fontStyle: "italic",
  lineHeight: 1.45,
  margin: "-6px 0 0",
  maxWidth: "620px",
  transition: "opacity 180ms ease",
} satisfies CSSProperties;

const missionReadoutStyle = {
  alignItems: "center",
  display: "grid",
  gap: "12px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
} satisfies CSSProperties;

const quietLabelStyle = {
  color: "#64748b",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const missionNameStyle = {
  color: "#cbd5e1",
  fontSize: "0.98rem",
  fontWeight: 800,
  lineHeight: 1.4,
} satisfies CSSProperties;

const compactProgressStyle = {
  minWidth: 0,
} satisfies CSSProperties;

const fuelTrackStyle = {
  background: "#020817",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "999px",
  height: "8px",
  overflow: "hidden",
} satisfies CSSProperties;

const fuelFillStyle = {
  background: "linear-gradient(90deg, #22c55e 0%, #86efac 70%, #fbbf24 100%)",
  borderRadius: "999px",
  boxShadow: "0 0 18px rgba(134, 239, 172, 0.22)",
  height: "100%",
  transition: "width 500ms ease",
} satisfies CSSProperties;

const statusMetaStyle = {
  color: "#94a3b8",
  fontSize: "0.82rem",
  marginTop: "7px",
} satisfies CSSProperties;

const detailsStyle = {
  borderTop: "1px solid rgba(148, 163, 184, 0.12)",
  opacity: 0.72,
  paddingTop: "10px",
} satisfies CSSProperties;

const summaryStyle = {
  color: "#cbd5e1",
  cursor: "pointer",
  fontSize: "0.92rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const supportFlowStyle = {
  display: "grid",
  gap: "14px",
  marginTop: "16px",
} satisfies CSSProperties;

const supportQuestionStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.2rem, 3vw, 1.7rem)",
  lineHeight: 1.18,
  margin: "8px 0 0",
} satisfies CSSProperties;

const supportLevelGridStyle = {
  display: "grid",
  gap: "9px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
} satisfies CSSProperties;

const supportLevelButtonStyle = {
  ...intentButtonStyle,
  minHeight: "78px",
} satisfies CSSProperties;

const supportLevelButtonActiveStyle = {
  background: "linear-gradient(180deg, rgba(134, 239, 172, 0.14), rgba(15, 23, 42, 0.72))",
  border: "1px solid rgba(134, 239, 172, 0.38)",
  boxShadow: "0 0 26px rgba(134, 239, 172, 0.08)",
} satisfies CSSProperties;

const supportGuidanceCardStyle = {
  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(2, 6, 23, 0.64))",
  border: "1px solid rgba(134, 239, 172, 0.2)",
  borderRadius: "18px",
  display: "grid",
  gap: "9px",
  padding: "14px",
} satisfies CSSProperties;

const supportTitleStyle = {
  color: "#f8fafc",
  fontSize: "1.1rem",
  lineHeight: 1.25,
  margin: 0,
} satisfies CSSProperties;

const supportStepStyle = {
  color: "#dbeafe",
  fontSize: "1rem",
  lineHeight: 1.5,
  margin: 0,
} satisfies CSSProperties;

const supportPhraseStyle = {
  color: "#bbf7d0",
  fontSize: "0.94rem",
  lineHeight: 1.45,
  margin: 0,
} satisfies CSSProperties;

const changeSupportButtonStyle = {
  justifySelf: "start",
  padding: "8px 10px",
} satisfies CSSProperties;

const guidanceGridStyle = {
  display: "grid",
  gap: "14px",
  marginTop: "16px",
} satisfies CSSProperties;

const fieldLabelStyle = {
  color: "#d1d5db",
  display: "grid",
  fontSize: "0.82rem",
  fontWeight: 900,
  gap: "8px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const fieldLabelOnlyStyle = {
  ...fieldLabelStyle,
  marginBottom: "8px",
} satisfies CSSProperties;

const inputStyle = {
  background: "#020817",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "16px",
  boxSizing: "border-box",
  color: "#f8fafc",
  fontSize: "1rem",
  outline: "none",
  padding: "13px 15px",
  textTransform: "none",
  width: "100%",
} satisfies CSSProperties;

const textareaStyle = {
  ...inputStyle,
  lineHeight: 1.5,
  minHeight: "108px",
  resize: "vertical",
} satisfies CSSProperties;

const modeRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
} satisfies CSSProperties;

const modeButtonStyle = {
  borderRadius: "999px",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: "0.92rem",
  fontWeight: 800,
  padding: "9px 11px",
} satisfies CSSProperties;

const promptRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
} satisfies CSSProperties;

const promptButtonStyle = {
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "999px",
  color: "#cbd5e1",
  cursor: "pointer",
  fontSize: "0.9rem",
  padding: "9px 11px",
} satisfies CSSProperties;

const guidanceButtonStyle = {
  background: "#86efac",
  border: "none",
  borderRadius: "16px",
  color: "#052e16",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 900,
  padding: "14px 18px",
} satisfies CSSProperties;
