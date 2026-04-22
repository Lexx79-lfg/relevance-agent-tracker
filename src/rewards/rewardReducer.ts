import { getRewardMath } from "./rewardMath";
import type { RewardEngineState, RewardPhase, RewardThemeId } from "./types";

export type RewardAction =
  | { type: "syncProgress"; currentValue: number; targetValue: number }
  | { type: "setPhase"; phase: RewardPhase }
  | { type: "setReducedMotion"; reducedMotion: boolean }
  | { type: "setSoundEnabled"; soundEnabled: boolean }
  | { type: "setTheme"; selectedThemeId: RewardThemeId }
  | { type: "tokenFeedback"; currentValue: number; targetValue: number }
  | { type: "checkpointFeedback"; currentValue: number; targetValue: number }
  | { type: "milestoneCharge"; currentValue: number; targetValue: number }
  | { type: "milestoneCelebrate" };

export function createRewardInitialState({
  currentValue,
  reducedMotion,
  selectedThemeId,
  soundEnabled,
  targetValue,
}: {
  currentValue: number;
  reducedMotion: boolean;
  selectedThemeId: RewardThemeId;
  soundEnabled: boolean;
  targetValue: number;
}): RewardEngineState {
  return {
    ...getRewardMath(currentValue, targetValue),
    celebrationKey: 0,
    phase: "idle",
    reducedMotion,
    selectedThemeId,
    soundEnabled,
  };
}

function applyProgress(
  state: RewardEngineState,
  currentValue: number,
  targetValue: number,
  phase: RewardPhase
): RewardEngineState {
  return {
    ...state,
    ...getRewardMath(currentValue, targetValue),
    phase,
  };
}

export function rewardReducer(state: RewardEngineState, action: RewardAction): RewardEngineState {
  if (action.type === "syncProgress") {
    return {
      ...state,
      ...getRewardMath(action.currentValue, action.targetValue),
    };
  }

  if (action.type === "setPhase") {
    return { ...state, phase: action.phase };
  }

  if (action.type === "setReducedMotion") {
    return { ...state, reducedMotion: action.reducedMotion };
  }

  if (action.type === "setSoundEnabled") {
    return { ...state, soundEnabled: action.soundEnabled };
  }

  if (action.type === "setTheme") {
    return { ...state, selectedThemeId: action.selectedThemeId };
  }

  if (action.type === "tokenFeedback") {
    return applyProgress(state, action.currentValue, action.targetValue, "tokenFeedback");
  }

  if (action.type === "checkpointFeedback") {
    return applyProgress(state, action.currentValue, action.targetValue, "checkpointFeedback");
  }

  if (action.type === "milestoneCharge") {
    return applyProgress(state, action.currentValue, action.targetValue, "milestoneCharge");
  }

  if (action.type === "milestoneCelebrate") {
    return {
      ...state,
      celebrationKey: state.celebrationKey + 1,
      phase: "milestoneCelebrate",
    };
  }

  return state;
}
