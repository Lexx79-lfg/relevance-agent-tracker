import type { JourneyPhase } from "../../types/journey";

export type RocketMissionState = "onPad" | "inSpace" | "landed";

export function getRocketMissionStateForPhase(phase: JourneyPhase): RocketMissionState {
  if (phase === "inProgress" || phase === "arrivalReady") return "inSpace";
  if (phase === "arrived") return "landed";

  return "onPad";
}
