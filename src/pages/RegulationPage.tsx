import type { CSSProperties } from "react";

export function RegulationPage() {
  return (
    <section className="mentor-panel command-panel command-screen" style={pageStyle}>
      <div className="command-kicker" style={kickerStyle}>REGULATION / SUPPORT</div>
      <h2 style={titleStyle}>A quieter place for panic, overwhelm, and repair.</h2>
      <p style={copyStyle}>
        Come here when pressure is high. The goal is not to solve everything; it is to get steady
        enough to choose the next safe move.
      </p>

      <div style={gridStyle}>
        <div className="command-card" style={cardStyle}>
          <div style={labelStyle}>OVERWHELM</div>
          <p style={smallCopyStyle}>Pause, breathe, and reduce the moment to one thing you can face.</p>
        </div>
        <div className="command-card" style={cardStyle}>
          <div style={labelStyle}>PANIC SUPPORT</div>
          <p style={smallCopyStyle}>Slow the body first. Problem-solving can wait until you have more ground.</p>
        </div>
        <div className="command-card" style={cardStyle}>
          <div style={labelStyle}>PARTNER / PARENT</div>
          <p style={smallCopyStyle}>Use short, safe words that protect both people and leave room for repair.</p>
        </div>
      </div>
    </section>
  );
}

const pageStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  padding: "clamp(20px, 4vw, 30px)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.26)",
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
  fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
  lineHeight: 1.1,
  margin: "0 0 12px",
} satisfies CSSProperties;

const copyStyle = {
  color: "#cbd5e1",
  fontSize: "1.05rem",
  lineHeight: 1.65,
  margin: "0 0 22px",
  maxWidth: "760px",
} satisfies CSSProperties;

const gridStyle = {
  display: "grid",
  gap: "14px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
} satisfies CSSProperties;

const cardStyle = {
  background: "#061120",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "18px",
  padding: "16px",
} satisfies CSSProperties;

const labelStyle = {
  color: "#fbbf24",
  fontSize: "0.8rem",
  fontWeight: 800,
  letterSpacing: "0.18em",
  marginBottom: "8px",
} satisfies CSSProperties;

const smallCopyStyle = {
  color: "#cbd5e1",
  fontSize: "0.98rem",
  lineHeight: 1.55,
  margin: 0,
} satisfies CSSProperties;
