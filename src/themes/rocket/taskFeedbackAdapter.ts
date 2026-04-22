import type { TaskProgressPulseTone } from "../../rewards/components/TaskProgressPulse";

export function getRocketTaskProgressPulseTone(rewarded: boolean): TaskProgressPulseTone {
  if (rewarded) {
    return {
      background: "linear-gradient(90deg, rgba(20, 83, 45, 0.38), rgba(251, 146, 60, 0.16))",
      border: "1px solid rgba(134, 239, 172, 0.28)",
      glow: "0 0 24px rgba(134, 239, 172, 0.14)",
      label: "Fuel transfer received",
    };
  }

  return {
    background: "linear-gradient(90deg, rgba(15, 23, 42, 0.72), rgba(56, 189, 248, 0.1))",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    glow: "0 0 18px rgba(125, 211, 252, 0.08)",
    label: "Action signal logged",
  };
}
