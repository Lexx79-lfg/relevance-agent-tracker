import type { ComponentType, ReactNode } from "react";

export type RewardPhase =
  | "idle"
  | "tokenFeedback"
  | "checkpointFeedback"
  | "milestoneCharge"
  | "milestoneLaunch"
  | "milestoneCelebrate"
  | "milestoneSettle";

export type RewardThemeId = string;

export type RewardSoundEvent = "token" | "checkpoint" | "milestoneCharge" | "milestoneLaunch" | "milestoneCelebrate";

export type RewardMathState = {
  currentValue: number;
  targetValue: number;
  cycleProgress: number;
  progressPercent: number;
  remaining: number;
  checkpointReached: boolean;
  milestoneReached: boolean;
};

export type RewardEngineState = RewardMathState & {
  celebrationKey: number;
  phase: RewardPhase;
  reducedMotion: boolean;
  selectedThemeId: RewardThemeId;
  soundEnabled: boolean;
};

export type RewardThemeLabels = {
  actionButton: string;
  checkpoint: string;
  milestoneTarget: string;
  progress: string;
  remaining: string;
  title: string;
};

export type RewardThemeTiming = {
  tokenFeedbackMs: number;
  checkpointFeedbackMs: number;
  milestoneChargeMs: number;
  milestoneLaunchMs: number;
  milestoneCelebrateMs: number;
  milestoneSettleMs: number;
};

export type RewardThemeCopyInput = {
  destinationName?: string;
  journeyPhase?: string;
  stageName?: string;
  targetName?: string;
  userName?: string;
};

export type RewardCelebrationCopy = {
  title: string;
  body: string;
  actionLabel: string;
};

export type RewardThemeSceneProps = {
  copy: RewardThemeCopyInput;
  state: RewardEngineState;
};

export type RewardThemeDefinition = {
  id: RewardThemeId;
  displayName: string;
  labels: RewardThemeLabels;
  timing: RewardThemeTiming;
  getCelebrationCopy: (input: RewardThemeCopyInput) => RewardCelebrationCopy;
  getStatusLabel?: (phase: RewardPhase) => string;
  playSound?: (event: RewardSoundEvent, soundEnabled: boolean) => void;
  renderTrackerOverride?: (state: RewardEngineState) => ReactNode;
  Scene: ComponentType<RewardThemeSceneProps>;
};
