import type { CSSProperties } from "react";
import { useJourney } from "../context/JourneyContext";
import { playCommandSound } from "../lib/commandSound";
import { RocketMilestoneExperience } from "./RocketMilestoneExperience";

export function MilestoneOverlay() {
  const { activeMilestoneReward, dismissMilestoneReward } = useJourney();

  if (!activeMilestoneReward) return null;

  function handleDismiss() {
    playCommandSound("confirm");
    dismissMilestoneReward();
  }

  return (
    <div className="command-event-backdrop" style={backdropStyle} role="dialog" aria-modal="true" aria-label="Milestone reward">
      <div className="command-panel command-screen command-event-panel" style={panelStyle}>
        <button
          className="mentor-soft-button"
          onClick={handleDismiss}
          style={dismissButtonStyle}
          aria-label="Dismiss milestone reward"
        >
          Close
        </button>

        {activeMilestoneReward.theme === "rocket" ? (
          <RocketMilestoneExperience event={activeMilestoneReward} />
        ) : (
          <div className="command-card" style={fallbackStyle}>
            <div className="command-kicker" style={fallbackKickerStyle}>MILESTONE COMPLETE</div>
            <h2 style={fallbackTitleStyle}>{activeMilestoneReward.milestoneName}</h2>
            <p style={fallbackCopyStyle}>{activeMilestoneReward.milestoneDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const backdropStyle = {
  alignItems: "stretch",
  background:
    "radial-gradient(circle at 50% 40%, rgba(251, 146, 60, 0.18), transparent 28%), radial-gradient(circle at 50% 58%, rgba(134, 239, 172, 0.14), transparent 34%), rgba(1, 4, 13, 0.9)",
  backdropFilter: "blur(14px)",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  padding: "clamp(10px, 2vw, 22px)",
  position: "fixed",
  zIndex: 50,
} satisfies CSSProperties;

const panelStyle = {
  background:
    "linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.96))",
  border: "1px solid rgba(134, 239, 172, 0.22)",
  borderRadius: "32px",
  boxShadow: "0 26px 90px rgba(0, 0, 0, 0.46), inset 0 0 50px rgba(134, 239, 172, 0.05)",
  minHeight: "calc(100vh - clamp(20px, 4vw, 44px))",
  maxHeight: "calc(100vh - clamp(20px, 4vw, 44px))",
  maxWidth: "1180px",
  overflow: "auto",
  padding: "clamp(18px, 4vw, 30px)",
  position: "relative",
  width: "100%",
} satisfies CSSProperties;

const dismissButtonStyle = {
  background: "rgba(15, 23, 42, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "999px",
  color: "#f8fafc",
  cursor: "pointer",
  fontWeight: 800,
  padding: "9px 14px",
  position: "absolute",
  right: "18px",
  top: "18px",
  zIndex: 4,
} satisfies CSSProperties;

const fallbackStyle = {
  padding: "56px 16px 18px",
  textAlign: "center",
} satisfies CSSProperties;

const fallbackKickerStyle = {
  color: "#86efac",
  fontSize: "0.78rem",
  fontWeight: 900,
  letterSpacing: "0.24em",
} satisfies CSSProperties;

const fallbackTitleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(2rem, 7vw, 4rem)",
  margin: "12px 0",
} satisfies CSSProperties;

const fallbackCopyStyle = {
  color: "#cbd5e1",
  fontSize: "1.05rem",
  lineHeight: 1.6,
} satisfies CSSProperties;
