import type { CSSProperties } from "react";
import { useRewardSystem } from "../RewardSystemProvider";

export function RewardTracker() {
  const { copy, earnProgress, state, theme } = useRewardSystem();
  const commandReady = copy.journeyPhase === "actionReady" || copy.journeyPhase === "arrivalReady";

  if (theme.renderTrackerOverride) {
    return <>{theme.renderTrackerOverride(state)}</>;
  }

  return (
    <div style={{ ...trackerStyle, ...getTrackerFeedbackStyle(state.phase) }}>
      <div style={headerStyle}>
        <span>{theme.labels.progress}</span>
        <strong>{Math.round(state.progressPercent)}%</strong>
      </div>
      <div style={trackStyle} aria-label={theme.labels.progress}>
        <div style={{ ...fillStyle, width: `${state.progressPercent}%` }} />
      </div>
      <div style={metaStyle}>
        {state.cycleProgress} / {state.targetValue} · {state.remaining} {theme.labels.remaining}
      </div>
      <div style={targetStyle}>
        <span>{theme.labels.milestoneTarget}</span>
        <strong>{copy.targetName ?? "Next milestone"}</strong>
      </div>
      <div style={statusLineStyle}>
        {commandReady ? "Major command is ready. Use the command button to continue." : theme.getStatusLabel?.(state.phase)}
      </div>
      <button
        className="mentor-primary-button"
        disabled={commandReady}
        onClick={earnProgress}
        style={{ ...buttonStyle, ...(commandReady ? disabledButtonStyle : {}) }}
        type="button"
      >
        {commandReady ? "Command ready" : theme.labels.actionButton}
      </button>
    </div>
  );
}

const trackerStyle = {
  borderRadius: "16px",
  display: "grid",
  gap: "10px",
  padding: "2px",
  transition: "box-shadow 220ms ease, background 220ms ease",
} satisfies CSSProperties;

function getTrackerFeedbackStyle(phase: string) {
  if (phase === "tokenFeedback") {
    return {
      background: "rgba(134, 239, 172, 0.04)",
      boxShadow: "0 0 22px rgba(134, 239, 172, 0.1)",
    } satisfies CSSProperties;
  }

  if (phase === "checkpointFeedback") {
    return {
      background: "rgba(251, 191, 36, 0.05)",
      boxShadow: "0 0 26px rgba(251, 191, 36, 0.12)",
    } satisfies CSSProperties;
  }

  if (phase.startsWith("milestone")) {
    return {
      background: "rgba(251, 146, 60, 0.05)",
      boxShadow: "0 0 30px rgba(251, 146, 60, 0.13)",
    } satisfies CSSProperties;
  }

  return {};
}

const headerStyle = {
  alignItems: "center",
  color: "#bbf7d0",
  display: "flex",
  fontSize: "0.78rem",
  fontWeight: 950,
  justifyContent: "space-between",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const trackStyle = {
  background: "#020817",
  border: "1px solid rgba(134, 239, 172, 0.32)",
  borderRadius: "999px",
  height: "22px",
  overflow: "hidden",
  padding: "3px",
} satisfies CSSProperties;

const fillStyle = {
  background: "linear-gradient(90deg, #14532d 0%, #22c55e 34%, #86efac 76%, #fbbf24 100%)",
  borderRadius: "999px",
  boxShadow: "0 0 26px rgba(134, 239, 172, 0.42)",
  height: "100%",
  transition: "width 420ms cubic-bezier(0.22, 1, 0.36, 1)",
} satisfies CSSProperties;

const metaStyle = {
  color: "#94a3b8",
  fontSize: "0.88rem",
} satisfies CSSProperties;

const targetStyle = {
  alignItems: "center",
  background: "rgba(2, 6, 23, 0.32)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "14px",
  color: "#cbd5e1",
  display: "flex",
  fontSize: "0.84rem",
  gap: "8px",
  justifyContent: "space-between",
  padding: "9px 10px",
} satisfies CSSProperties;

const statusLineStyle = {
  color: "#fde68a",
  fontSize: "0.84rem",
  fontWeight: 850,
  letterSpacing: "0.02em",
} satisfies CSSProperties;

const buttonStyle = {
  justifySelf: "start",
  minHeight: "44px",
  padding: "12px 18px",
} satisfies CSSProperties;

const disabledButtonStyle = {
  cursor: "not-allowed",
  filter: "saturate(0.76)",
  opacity: 0.62,
} satisfies CSSProperties;
