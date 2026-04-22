import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useJourney } from "../context/JourneyContext";
import { playUiFeedback } from "../lib/uiFeedback";
import type { MentorTone, MotivationStyle, OnboardingAnswers, RewardStyle } from "../types/journey";

const TONE_OPTIONS: Array<{ value: MentorTone; label: string }> = [
  { value: "calm", label: "Calm" },
  { value: "direct", label: "Direct" },
  { value: "encouraging", label: "Encouraging" },
];

const MOTIVATION_OPTIONS: Array<{ value: MotivationStyle; label: string }> = [
  { value: "gentle", label: "Gentle" },
  { value: "structured", label: "Structured" },
  { value: "challenge", label: "Challenge" },
  { value: "reflective", label: "Reflective" },
];

const REWARD_OPTIONS: Array<{ value: RewardStyle; label: string }> = [
  { value: "rocket", label: "Rocket journey" },
  { value: "celebration", label: "Celebration" },
  { value: "quiet", label: "Quiet progress" },
  { value: "adventure", label: "Adventure" },
];

const TOTAL_STEPS = 6;

function getDefaultAnswers(): OnboardingAnswers {
  return {
    name: "",
    preferredTone: "calm",
    primaryLifeGoal: "",
    biggestStruggle: "",
    motivationStyle: "gentle",
    desiredRewardStyle: "rocket",
  };
}

export function OnboardingFlow() {
  const { cancelProfileEdit, completeOnboarding, currentUser, isEditingProfile } = useJourney();
  const [step, setStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>(() =>
    currentUser
      ? {
          name: currentUser.name,
          preferredTone: currentUser.preferredTone,
          primaryLifeGoal: currentUser.primaryLifeGoal,
          biggestStruggle: currentUser.biggestStruggle,
          motivationStyle: currentUser.motivationStyle,
          desiredRewardStyle: currentUser.desiredRewardStyle,
        }
      : getDefaultAnswers()
  );

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  function updateAnswer(update: Partial<OnboardingAnswers>) {
    setAnswers((current) => ({ ...current, ...update }));
  }

  function goNext() {
    if (isAdvancing) return;

    setIsAdvancing(true);

    advanceTimerRef.current = window.setTimeout(() => {
      if (step === TOTAL_STEPS - 1) {
        completeOnboarding(answers);
        return;
      }

      setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
      setIsAdvancing(false);
    }, 220);
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <section className="mentor-panel command-panel command-screen onboarding-panel" style={panelStyle}>
      <div className="command-kicker" style={kickerStyle}>
        {isEditingProfile ? "REFINE YOUR ROUTE" : "SYSTEMS INITIALIZATION"}
      </div>
      <h2 style={titleStyle}>{isEditingProfile ? "Adjust the setup with care." : "Let’s set your route gently."}</h2>
      <p style={copyStyle}>
        {isEditingProfile
          ? "This updates your personalized mentor and journey setup. Your past milestone history stays intact unless you choose reset from Settings."
          : "A few answers help Relevance Agent shape the mentor tone, journey stages, and reward style. You can keep this simple; nothing here needs to be perfect."}
      </p>

      <div style={progressTrackStyle}>
        <div style={{ ...progressFillStyle, width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>
      <div style={stepReadoutStyle}>
        <span className="status-light" />
        Setup channel {step + 1} of {TOTAL_STEPS}
      </div>

      <div
        key={step}
        style={{
          ...stepContentStyle,
          ...(isAdvancing ? stepContentAdvancingStyle : {}),
        }}
      >
      {step === 0 && (
        <div className="command-card" style={questionStyle}>
          <label style={labelStyle}>What should your mentor call you?</label>
          <input
            value={answers.name}
            onChange={(event) => updateAnswer({ name: event.target.value })}
            onFocus={() => playUiFeedback("light")}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
      )}

      {step === 1 && (
        <ChoiceStep
          title="What mentor tone would help most?"
          options={TONE_OPTIONS}
          selected={answers.preferredTone}
          onSelect={(preferredTone) => updateAnswer({ preferredTone })}
        />
      )}

      {step === 2 && (
        <div className="command-card" style={questionStyle}>
          <label style={labelStyle}>What is the primary life goal you want support with?</label>
          <textarea
            value={answers.primaryLifeGoal}
            onChange={(event) => updateAnswer({ primaryLifeGoal: event.target.value })}
            onFocus={() => playUiFeedback("light")}
            placeholder="Example: become consistent with my health, work, and relationships"
            rows={4}
            style={textareaStyle}
          />
        </div>
      )}

      {step === 3 && (
        <div className="command-card" style={questionStyle}>
          <label style={labelStyle}>What is the biggest struggle in the way right now?</label>
          <textarea
            value={answers.biggestStruggle}
            onChange={(event) => updateAnswer({ biggestStruggle: event.target.value })}
            onFocus={() => playUiFeedback("light")}
            placeholder="Example: overwhelm, avoidance, indecision, relationship stress"
            rows={4}
            style={textareaStyle}
          />
        </div>
      )}

      {step === 4 && (
        <ChoiceStep
          title="What motivation style fits you best right now?"
          options={MOTIVATION_OPTIONS}
          selected={answers.motivationStyle}
          onSelect={(motivationStyle) => updateAnswer({ motivationStyle })}
        />
      )}

      {step === 5 && (
        <ChoiceStep
          title="What reward style would feel meaningful?"
          options={REWARD_OPTIONS}
          selected={answers.desiredRewardStyle}
          onSelect={(desiredRewardStyle) => updateAnswer({ desiredRewardStyle })}
        />
      )}
      </div>

      <div aria-live="polite" style={{ ...acceptedStyle, opacity: isAdvancing ? 1 : 0 }}>
        Signal accepted.
      </div>

      <div style={buttonRowStyle}>
        <div style={leftButtonGroupStyle}>
          <button className="mentor-soft-button" onClick={goBack} onPointerDown={() => playUiFeedback("light")} disabled={step === 0 || isAdvancing} style={secondaryButtonStyle}>
            Back
          </button>
          {isEditingProfile && (
            <button
              className="mentor-soft-button"
              onClick={() => {
                cancelProfileEdit();
              }}
              onPointerDown={() => playUiFeedback("light")}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
          )}
        </div>
        <button className="mentor-primary-button" disabled={isAdvancing} onClick={goNext} onPointerDown={() => playUiFeedback("progress")} style={primaryButtonStyle}>
          {isAdvancing
            ? "Accepted"
            : step === TOTAL_STEPS - 1
              ? isEditingProfile
                ? "Save my route"
                : "Start my journey"
              : "Continue"}
        </button>
      </div>
    </section>
  );
}

function ChoiceStep<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: Array<{ value: T; label: string }>;
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="command-card" style={questionStyle}>
      <div style={labelStyle}>{title}</div>
      <div style={choiceGridStyle}>
        {options.map((option) => {
          const active = selected === option.value;

          return (
            <button
              className={`mentor-soft-button command-tab ${active ? "command-choice-active" : ""}`}
              key={option.value}
              onClick={() => {
                onSelect(option.value);
              }}
              onPointerDown={() => playUiFeedback("light")}
              style={{
                ...choiceButtonStyle,
                background: active ? "rgba(134, 239, 172, 0.16)" : "rgba(15, 23, 42, 0.78)",
                border: active
                  ? "1px solid rgba(134, 239, 172, 0.58)"
                  : "1px solid rgba(148, 163, 184, 0.16)",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const panelStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  boxShadow: "0 22px 70px rgba(0,0,0,0.26)",
  margin: "0 auto",
  maxWidth: "760px",
  padding: "clamp(22px, 4vw, 34px)",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.84rem",
  fontWeight: 800,
  letterSpacing: "0.2em",
  marginBottom: "12px",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
  lineHeight: 1.05,
  margin: "0 0 12px",
} satisfies CSSProperties;

const copyStyle = {
  color: "#cbd5e1",
  fontSize: "1.05rem",
  lineHeight: 1.65,
  margin: "0 0 22px",
} satisfies CSSProperties;

const progressTrackStyle = {
  background: "#020817",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "999px",
  height: "12px",
  marginBottom: "24px",
  overflow: "hidden",
} satisfies CSSProperties;

const progressFillStyle = {
  background: "linear-gradient(90deg, #22c55e 0%, #86efac 70%, #fbbf24 100%)",
  borderRadius: "999px",
  height: "100%",
  transition: "width 240ms ease",
} satisfies CSSProperties;

const stepContentStyle = {
  animation: "onboardingStepIn 260ms ease-out both",
  transition: "opacity 180ms ease, transform 180ms ease, filter 180ms ease",
} satisfies CSSProperties;

const stepContentAdvancingStyle = {
  filter: "brightness(1.08)",
  opacity: 0.72,
  transform: "translateY(-3px)",
} satisfies CSSProperties;

const acceptedStyle = {
  color: "#bbf7d0",
  fontSize: "0.84rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  marginTop: "12px",
  minHeight: "1.2em",
  textTransform: "uppercase",
  transition: "opacity 120ms ease",
} satisfies CSSProperties;

const questionStyle = {
  display: "grid",
  gap: "12px",
  background: "rgba(2, 6, 23, 0.38)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "20px",
  padding: "18px",
} satisfies CSSProperties;

const stepReadoutStyle = {
  alignItems: "center",
  color: "#d9f99d",
  display: "flex",
  fontSize: "0.82rem",
  fontWeight: 900,
  gap: "10px",
  letterSpacing: "0.14em",
  margin: "-10px 0 18px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const labelStyle = {
  color: "#d1d5db",
  fontSize: "0.9rem",
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const inputStyle = {
  background: "#020817",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  borderRadius: "18px",
  boxSizing: "border-box",
  color: "#f8fafc",
  fontSize: "1.05rem",
  outline: "none",
  padding: "16px 18px",
  width: "100%",
} satisfies CSSProperties;

const textareaStyle = {
  ...inputStyle,
  lineHeight: 1.55,
  minHeight: "130px",
  resize: "vertical",
} satisfies CSSProperties;

const choiceGridStyle = {
  display: "grid",
  gap: "10px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
} satisfies CSSProperties;

const choiceButtonStyle = {
  borderRadius: "18px",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 800,
  padding: "16px",
  textAlign: "left",
  transition: "transform 180ms ease, border-color 180ms ease, background 180ms ease",
} satisfies CSSProperties;

const buttonRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  justifyContent: "space-between",
  marginTop: "24px",
} satisfies CSSProperties;

const leftButtonGroupStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
} satisfies CSSProperties;

const primaryButtonStyle = {
  background: "#86efac",
  border: "none",
  borderRadius: "18px",
  color: "#052e16",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 800,
  padding: "14px 20px",
} satisfies CSSProperties;

const secondaryButtonStyle = {
  background: "rgba(15, 23, 42, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "18px",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 700,
  opacity: 1,
  padding: "14px 20px",
} satisfies CSSProperties;
