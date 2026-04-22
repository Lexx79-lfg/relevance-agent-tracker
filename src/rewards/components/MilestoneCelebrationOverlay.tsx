import type { CSSProperties } from "react";
import { useRewardSystem } from "../RewardSystemProvider";

export function MilestoneCelebrationOverlay() {
  const { copy, dismissCelebration, state, theme } = useRewardSystem();

  if (state.phase !== "milestoneCelebrate") return null;

  const celebration = theme.getCelebrationCopy(copy);

  return (
    <div key={state.celebrationKey} style={overlayStyle} role="status" aria-live="polite">
      <div style={cardStyle}>
        <div style={kickerStyle}>{theme.displayName}</div>
        <h3 style={titleStyle}>{celebration.title}</h3>
        <p style={bodyStyle}>{celebration.body}</p>
        <button className="mentor-primary-button" onClick={dismissCelebration} style={buttonStyle} type="button">
          {celebration.actionLabel}
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  alignItems: "center",
  background: "rgba(2, 6, 23, 0.72)",
  borderRadius: "24px",
  display: "flex",
  inset: "12px",
  justifyContent: "center",
  padding: "14px",
  position: "absolute",
  zIndex: 10,
} satisfies CSSProperties;

const cardStyle = {
  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(2, 6, 23, 0.96))",
  border: "1px solid rgba(134, 239, 172, 0.28)",
  borderRadius: "22px",
  boxShadow: "0 24px 70px rgba(0,0,0,0.36)",
  maxWidth: "360px",
  padding: "18px",
  textAlign: "center",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "1.35rem",
  lineHeight: 1.12,
  margin: "8px 0",
} satisfies CSSProperties;

const bodyStyle = {
  color: "#cbd5e1",
  fontSize: "0.95rem",
  lineHeight: 1.45,
  margin: "0 0 14px",
} satisfies CSSProperties;

const buttonStyle = {
  minHeight: "42px",
  padding: "10px 14px",
} satisfies CSSProperties;
