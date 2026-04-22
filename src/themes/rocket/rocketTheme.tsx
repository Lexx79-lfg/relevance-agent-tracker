import { RocketRewardScene } from "./RocketRewardScene";
import { getRocketCelebrationCopy, getRocketStatusLabel, rocketLabels } from "./rocketCopy";
import { playRocketRewardSound } from "./rocketSounds";
import type { RewardThemeDefinition } from "../../rewards/types";

export const rocketTheme: RewardThemeDefinition = {
  id: "rocket",
  displayName: "Rocket mission",
  labels: rocketLabels,
  timing: {
    tokenFeedbackMs: 620,
    checkpointFeedbackMs: 820,
    milestoneChargeMs: 680,
    milestoneLaunchMs: 1280,
    milestoneCelebrateMs: 1500,
    milestoneSettleMs: 900,
  },
  getCelebrationCopy: getRocketCelebrationCopy,
  getStatusLabel: getRocketStatusLabel,
  playSound: playRocketRewardSound,
  Scene: RocketRewardScene,
};
