import type { CSSProperties, ReactNode } from "react";

export type TaskProgressPulseTone = {
  background: string;
  border: string;
  glow: string;
  label: string;
};

export function TaskProgressPulse({
  active,
  detail,
  keyValue,
  tone,
}: {
  active: boolean;
  detail?: ReactNode;
  keyValue: number;
  tone: TaskProgressPulseTone;
}) {
  if (!active) return null;

  return (
    <div key={keyValue} style={{ ...pulseStyle, background: tone.background, border: tone.border, boxShadow: tone.glow }}>
      <span style={beadStyle} />
      <span>{tone.label}</span>
      {detail && <strong style={detailStyle}>{detail}</strong>}
    </div>
  );
}

const pulseStyle = {
  alignItems: "center",
  animation: "taskProgressTransfer 300ms ease-out both",
  borderRadius: "999px",
  color: "#f8fafc",
  display: "flex",
  fontSize: "0.82rem",
  fontWeight: 850,
  gap: "8px",
  letterSpacing: "0.03em",
  marginTop: "8px",
  overflow: "hidden",
  padding: "8px 10px",
  position: "relative",
} satisfies CSSProperties;

const beadStyle = {
  animation: "taskProgressBead 300ms ease-out both",
  background: "#fef3c7",
  borderRadius: "999px",
  boxShadow: "0 0 16px rgba(251, 191, 36, 0.55)",
  display: "inline-block",
  height: "8px",
  width: "8px",
} satisfies CSSProperties;

const detailStyle = {
  color: "#bbf7d0",
  marginLeft: "auto",
} satisfies CSSProperties;
