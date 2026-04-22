import type { CSSProperties } from "react";
import { useJourney } from "../context/JourneyContext";

export function SettingsPage() {
  const {
    currentJourney,
    currentUser,
    mentorState,
    milestoneRewardHistory,
    resetJourney,
    startProfileEdit,
  } = useJourney();

  function handleResetJourney() {
    const confirmed = window.confirm(
      "Reset your personalized journey and milestone history? This will return you to onboarding."
    );

    if (confirmed) {
      resetJourney();
    }
  }

  return (
    <section style={pageStyle}>
      <div className="command-panel command-screen" style={cardStyle}>
        <div className="command-kicker" style={kickerStyle}>PROFILE SETTINGS</div>
        <h2 style={titleStyle}>Adjust your mentor setup gently.</h2>
        <p style={copyStyle}>
          Use this area when your goal, tone, or reward style needs to change. Editing is safe and
          intentional; resetting is the clean slate for retesting onboarding.
        </p>

        <div style={summaryGridStyle}>
          <SummaryItem label="Name" value={currentUser?.name ?? "Not set"} status="green" />
          <SummaryItem label="Tone" value={currentUser?.preferredTone ?? "Not set"} status="green" />
          <SummaryItem label="Journey" value={currentJourney?.title ?? "Not started"} status="amber" />
          <SummaryItem label="Reward style" value={currentUser?.desiredRewardStyle ?? "Not set"} status="green" />
          <SummaryItem label="Mentor state" value={mentorState} status={mentorState === "setback" ? "amber" : "green"} />
          <SummaryItem label="Progress" value={`${currentJourney?.progress ?? 0} completed steps`} status="green" />
          <SummaryItem label="Milestone history" value={`${milestoneRewardHistory.length} saved`} status="amber" />
        </div>

        <div style={actionGridStyle}>
          <div className="command-card" style={actionCardStyle}>
            <h3 style={actionTitleStyle}>Edit Profile / Re-run Onboarding</h3>
            <p style={actionCopyStyle}>
              Review your answers with the current profile prefilled. Saving creates a refreshed
              journey setup, while your milestone reward history stays available.
            </p>
            <button className="mentor-primary-button" onClick={startProfileEdit} style={primaryButtonStyle}>
              Edit my setup
            </button>
          </div>

          <div className="command-card" style={dangerCardStyle}>
            <h3 style={actionTitleStyle}>Reset Journey</h3>
            <p style={actionCopyStyle}>
              Clear the personalized journey, mentor state, and milestone reward history. You will
              be asked to confirm before anything is cleared.
            </p>
            <button className="mentor-soft-button" onClick={handleResetJourney} style={resetButtonStyle}>
              Reset journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({
  label,
  status,
  value,
}: {
  label: string;
  status: "green" | "amber";
  value: string;
}) {
  return (
    <div className="command-card" style={summaryItemStyle}>
      <div style={summaryLabelStyle}>
        <span className={`status-light ${status === "amber" ? "status-light-amber" : ""}`} />
        {label}
      </div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

const pageStyle = {
  display: "grid",
  gap: "18px",
} satisfies CSSProperties;

const cardStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  boxShadow: "0 22px 70px rgba(0,0,0,0.22)",
  padding: "clamp(22px, 4vw, 34px)",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.82rem",
  fontWeight: 900,
  letterSpacing: "0.2em",
  marginBottom: "10px",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
  lineHeight: 1.05,
  margin: 0,
} satisfies CSSProperties;

const copyStyle = {
  color: "#cbd5e1",
  fontSize: "1.04rem",
  lineHeight: 1.65,
  margin: "14px 0 22px",
  maxWidth: "760px",
} satisfies CSSProperties;

const summaryGridStyle = {
  display: "grid",
  gap: "10px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  marginBottom: "22px",
} satisfies CSSProperties;

const summaryItemStyle = {
  background: "rgba(2, 6, 23, 0.54)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "18px",
  padding: "14px",
} satisfies CSSProperties;

const summaryLabelStyle = {
  alignItems: "center",
  color: "#94a3b8",
  display: "flex",
  fontSize: "0.74rem",
  fontWeight: 900,
  gap: "8px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const summaryValueStyle = {
  color: "#f8fafc",
  fontSize: "1rem",
  fontWeight: 800,
  marginTop: "6px",
} satisfies CSSProperties;

const actionGridStyle = {
  display: "grid",
  gap: "14px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
} satisfies CSSProperties;

const actionCardStyle = {
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(134, 239, 172, 0.18)",
  borderRadius: "22px",
  padding: "18px",
} satisfies CSSProperties;

const dangerCardStyle = {
  ...actionCardStyle,
  border: "1px solid rgba(251, 146, 60, 0.24)",
} satisfies CSSProperties;

const actionTitleStyle = {
  color: "#f8fafc",
  fontSize: "1.12rem",
  margin: 0,
} satisfies CSSProperties;

const actionCopyStyle = {
  color: "#cbd5e1",
  fontSize: "0.98rem",
  lineHeight: 1.55,
  margin: "10px 0 16px",
} satisfies CSSProperties;

const primaryButtonStyle = {
  background: "#86efac",
  border: "none",
  borderRadius: "16px",
  color: "#052e16",
  cursor: "pointer",
  fontSize: "0.98rem",
  fontWeight: 900,
  padding: "12px 16px",
} satisfies CSSProperties;

const resetButtonStyle = {
  background: "rgba(251, 146, 60, 0.12)",
  border: "1px solid rgba(251, 146, 60, 0.35)",
  borderRadius: "16px",
  color: "#fed7aa",
  cursor: "pointer",
  fontSize: "0.98rem",
  fontWeight: 900,
  padding: "12px 16px",
} satisfies CSSProperties;
