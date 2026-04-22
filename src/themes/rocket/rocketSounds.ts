import { playCommandSound } from "../../lib/commandSound";
import type { RewardSoundEvent } from "../../rewards/types";

export function playRocketRewardSound(event: RewardSoundEvent, soundEnabled: boolean) {
  if (!soundEnabled) return;

  if (event === "token") {
    playCommandSound("fuel");
    return;
  }

  if (event === "checkpoint") {
    playCommandSound("confirm");
    return;
  }

  if (event === "milestoneCharge" || event === "milestoneLaunch") {
    playCommandSound("ignition");
    return;
  }

  playCommandSound("confirm");
}
