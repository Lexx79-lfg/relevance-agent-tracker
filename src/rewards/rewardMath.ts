import type { RewardMathState } from "./types";

export function getRewardMath(currentValue: number, targetValue: number): RewardMathState {
  const safeTarget = Math.max(targetValue, 1);
  const safeCurrent = Math.max(currentValue, 0);
  const cycleProgress = Math.min(safeCurrent, safeTarget);
  const progressPercent = Math.min(Math.max((cycleProgress / safeTarget) * 100, 0), 100);
  const remaining = Math.max(safeTarget - cycleProgress, 0);
  const checkpointReached = progressPercent >= 50 && progressPercent < 100;
  const milestoneReached = cycleProgress >= safeTarget;

  return {
    currentValue: safeCurrent,
    targetValue: safeTarget,
    cycleProgress,
    progressPercent,
    remaining,
    checkpointReached,
    milestoneReached,
  };
}

export function getNextRewardMath(currentValue: number, targetValue: number) {
  return getRewardMath(currentValue + 1, targetValue);
}
