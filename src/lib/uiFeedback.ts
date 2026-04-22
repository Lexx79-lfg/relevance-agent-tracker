import { playCommandSound } from "./commandSound";

type FeedbackIntensity = "light" | "progress";
type MajorCommandKind = "launch" | "land";

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;

  navigator.vibrate(pattern);
}

export function playUiFeedback(intensity: FeedbackIntensity = "light") {
  if (intensity === "progress") {
    vibrate([12, 18, 18]);
    playCommandSound("confirm");
    return;
  }

  vibrate(8);
  playCommandSound("tab");
}

export function playMajorCommandFeedback(kind: MajorCommandKind) {
  vibrate(kind === "launch" ? [16, 24, 28] : [14, 20, 18]);
  playCommandSound(kind === "launch" ? "ignition" : "confirm");
}
